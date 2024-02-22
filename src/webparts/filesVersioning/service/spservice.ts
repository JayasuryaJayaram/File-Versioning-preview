import { getSP } from "./pnpConfig";

export async function UploadFile(file: File, folderPath: string) {
  try {
    const fileNamePath: any = encodeURI(file.name);
    const decodedFileNamePath = decodeURIComponent(fileNamePath);

    const sp = getSP();
    let result: any;

    if (file.size <= 10485760) {
      // small upload
      result = await sp.web
        .getFolderByServerRelativePath(folderPath)
        .files.addUsingPath(decodedFileNamePath, file, { Overwrite: true });
    } else {
      // large upload
      result = await sp.web
        .getFolderByServerRelativePath(folderPath)
        .files.addChunked(
          decodedFileNamePath,
          file,
          (data) => {
            console.log(`progress`);
          },
          true
        );
    }

    console.log(`Result of file upload: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error("Error during file upload:", error);
    throw error;
  }
}

export async function getAllFilesInFolder(folderPath: string) {
  try {
    const sp = getSP();
    const folder: any = sp.web.getFolderByServerRelativePath(folderPath);

    const files = await folder.files();

    return files;
  } catch (error) {
    console.error("Error fetching files from folder:", error);
    throw error;
  }
}

export const getFileVersionHistory = async (fileUniqueId: string) => {
  try {
    // Make a direct REST API call to fetch file versions
    const sp = getSP();

    const versions = await sp.web.getFileById(fileUniqueId).versions();
    console.log(versions);

    // Transform the versions array to include necessary information for each version
    const versionHistory = versions.map((version: any) => ({
      versionNumber: version.VersionLabel,
      modifiedBy: version.CreatedBy ? version.CreatedBy.Name : "",
      modifiedDate: version.Created
        ? new Date(version.Created).toLocaleString().substring(0, 10)
        : "",
      modifiedTime: version.Created
        ? new Date(version.Created).toLocaleString().substring(12, 20)
        : "",
      size: version.Size,
    }));

    // Fetch the file to get the current version information
    const fileItem: any = await (
      await sp.web.getFileById(fileUniqueId).getItem()
    )
      .select("*")
      .expand("*");
    console.log(fileItem);

    // If file is found, add current version information to versionHistory
    if (fileItem) {
      versionHistory.push({
        versionNumber: fileItem.OData__UIVersionString,
        modifiedBy: fileItem.ModifiedBy ? fileItem.ModifiedBy.Name : "",
        modifiedDate: fileItem.Modified
          ? new Date(fileItem.Modified).toLocaleString().substring(0, 10)
          : "",
        modifiedTime: fileItem.Modified
          ? new Date(fileItem.Modified).toLocaleString().substring(12, 20)
          : "",
        size: fileItem.Length,
      });
    }

    return versionHistory;
  } catch (error) {
    console.error("Error fetching file version history:", error);
    throw error;
  }
};

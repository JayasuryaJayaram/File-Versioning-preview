import * as React from "react";
import { useEffect, useState } from "react";
import { Button, Table, Popover, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  getAllFilesInFolder,
  getFileVersionHistory,
  UploadFile,
} from "../service/spservice";
import type { IFilesVersioningProps } from "./IFilesVersioningProps";
import styles from "./FilesVersioning.module.scss";

const FilesVersioning = (props: IFilesVersioningProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [versionHistories, setVersionHistories] = useState<{
    [key: string]: any[];
  }>({});
  const [popoverVisible, setPopoverVisible] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const files: any = await getAllFilesInFolder("DocumentsUploaded");
      setFiles(files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileChange = (info: any) => {
    const file = info.file.originFileObj;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    try {
      if (selectedFile) {
        await UploadFile(selectedFile, "DocumentsUploaded");
        await fetchFiles();
        message.success("File Uploaded Successfully!");
      } else {
        console.warn("No file selected for upload");
        message.error("Error Uploading File");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    }
  };

  const handleFileVersionHistory = async (
    fileUniqueId: string,
    record: any
  ) => {
    try {
      const history = await getFileVersionHistory(fileUniqueId);
      setVersionHistories({ ...versionHistories, [fileUniqueId]: history });
      setPopoverVisible({ ...popoverVisible, [fileUniqueId]: true });
    } catch (error) {
      console.error("Error fetching file version history:", error);
    }
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "Name",
      key: "Name",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Popover
          content={
            <Table
              dataSource={versionHistories[record.UniqueId]}
              columns={[
                {
                  title: "Version",
                  dataIndex: "versionNumber",
                  key: "versionNumber",
                },
                // {
                //   title: "Modified By",
                //   dataIndex: "modifiedBy",
                //   key: "modifiedBy",
                // },
                {
                  title: "Modified Date",
                  dataIndex: "modifiedDate",
                  key: "modifiedDate",
                },
                {
                  title: "Modified Time",
                  dataIndex: "modifiedTime",
                  key: "modifiedDate",
                },
                // { title: "Size", dataIndex: "size", key: "size" },
              ]}
              pagination={false}
            />
          }
          trigger="click"
          visible={popoverVisible[record.UniqueId]}
          onVisibleChange={(visible) =>
            setPopoverVisible({ ...popoverVisible, [record.UniqueId]: visible })
          }
        >
          <Button
            onClick={() => handleFileVersionHistory(record.UniqueId, record)}
          >
            View Version History
          </Button>
        </Popover>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* <div style={{ display: "none" }}>
        <div className={styles.heading}>File Upload</div>
        <div style={{ margin: "20px 0" }}>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
        </div>
      </div> */}

      <div className={styles.card}>
        <div className={styles.heading}>File Upload</div>
        <div className={styles.contentBox}>
          <img
            src={require("../assets/server.png")}
            alt="Upload Img"
            className={styles.uploadImg}
          />
          <p className={styles.text}>
            upload your{" "}
            <span style={{ fontWeight: "600", textDecoration: "underline" }}>
              files
            </span>{" "}
            to cloud
          </p>
        </div>
        <div className={styles.inputs}>
          <Upload
            customRequest={handleUpload}
            showUploadList={false}
            onChange={handleFileChange}
          >
            <Button
              icon={<UploadOutlined rev={undefined} />}
              style={{ marginTop: "15px" }}
            >
              Upload
            </Button>
          </Upload>
        </div>
      </div>

      <div className={styles.heading}>Folders in DocumentsUploaded</div>
      <Table
        dataSource={files}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default FilesVersioning;

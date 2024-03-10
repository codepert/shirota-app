import React, { useState, useEffect } from "react";
import axios from "axios";
import { warehouseURL } from "../utils/constants";
import CTable from "../components/CTable";
import { Form, Input, Layout, Button, Modal, Card } from "antd";

import { openNotificationWithIcon } from "../components/common/notification";

import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../components/common/CustomButton";
import WarehouseRegisterModal from "../features/warehouse/register.modal";
import DeleteModal from "../components/common/delete.modal";
import $lang from "../utils/content/jp.json";
import { API } from "../utils/helper";
const { Content } = Layout;

const WarehouseList = ({ is_edit }) => {
  const [isposted, setIsPosted] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false);

  const [allData, setAllData] = useState([]);

  const [handleId, setHandleId] = useState("");

  const warehouseListColumns = [
    {
      title: `${$lang.tableCommon.no}`,
      dataIndex: "key",
      align: "center",
      width: "8%",
    },
    {
      title: `${$lang.WarehousePage.name}`,
      key: "name",
      dataIndex: "name",
      align: "center",
      render: (text, record, dataIndex) => {
        return (
          <div>
            {record.name.slice(0, 18)}
            {text.length >= 18 ? "..." : ""}
          </div>
        );
      },
    },
    is_edit === 1 ? (
      {
        title: `#`,
        dataIndex: "operation",
        render: (text, record, dataIndex) => {
          return (
            <div className="flex justify-center items-center">
              <div className="hidden rounded-full"></div>
              <div className="p-2 rounded-full cursor-pointer items-center text-center">
                <CustomButton
                  onClick={() => {
                    setModalData(record);
                    handleShowModal();
                  }}
                  title={$lang.buttons.change}
                  icon={<EditOutlined />}
                  size="small"
                  className="btn-default btn-hover-black"
                  style={{ backgroundColor: "transparent", color: "#000" }}
                  visability={true}
                />{" "}
              </div>
              <div className="p-2 rounded-full cursor-pointer items-center text-center ml-2">
                <CustomButton
                  onClick={() => {
                    handleShowDeleteModal();

                    setHandleId(record.id);
                  }}
                  title={$lang.buttons.delete}
                  icon={<DeleteOutlined />}
                  style={{ backgroundColor: "transparent", color: "#000" }}
                  size="small"
                  className="btn-default btn-hover-black"
                  visability={true}
                />
              </div>
            </div>
          );
        },
        align: "center",
      }
    ) : (
      <div></div>
    ),
  ];

  const getWarehouseList = () => {
    axios.get(`${warehouseURL}`).then((res) => {
      let index = 1;
      const warehouseData = res.data.map((item) => {
        return {
          ...item,
          key: index++,
        };
      });
      setAllData(warehouseData);
    });
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const handleRegisterModal = (data) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createWarehouse(data);
    } else {
      updateWarehouse(data);
    }
  };

  const createWarehouse = (data) => {
    API.post(warehouseURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        handleHideModal();
        setIsPosted(!isposted);
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const updateWarehouse = (data) => {
    API.put(`${warehouseURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        handleHideModal();
        setIsPosted(!isposted);
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const handleDelete = (deltedId) => {
    API.delete(`${warehouseURL}/${deltedId}`)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        setIsPosted(!isposted);
        handleHideDeleteModal();
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const handleShowDeleteModal = () => {
    setIsDeletedModalVisible(true);
  };

  const handleHideDeleteModal = () => {
    setIsDeletedModalVisible(false);
  };

  useEffect(() => {
    getWarehouseList();
  }, [isposted]);

  return (
    <div>
      <Content
        style={{ width: 1024 }}
        className="mx-auto flex flex-col content-h"
      >
        <Card
          style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
          className="py-2 my-2"
          bordered={false}
        >
          <div>
            <div className="mt-5" style={{ marginLeft: "880px" }}>
              {is_edit === 1 ? (
                <Button
                  onClick={() => {
                    handleShowModal();
                    setModalData(null);
                  }}
                  className="btn-bg-black"
                >
                  {$lang?.Maintenance?.addNew}
                </Button>
              ) : (
                <div></div>
              )}
              <WarehouseRegisterModal
                isOpen={isModalVisible}
                onClose={handleHideModal}
                onSave={handleRegisterModal}
                initialValues={modalData}
              />{" "}
              <DeleteModal
                isOpen={isDeletedModalVisible}
                onClose={handleHideDeleteModal}
                onDelete={handleDelete}
                deletedId={handleId}
              />
            </div>
            <div className="mt-5">
              <CTable
                rowKey={(node) => node.id}
                dataSource={allData}
                columns={warehouseListColumns}
                pagination={true}
              />
            </div>
          </div>
        </Card>
      </Content>
    </div>
  );
};
export default WarehouseList;

import React, { useState, useEffect } from "react";
import axios from "axios";
import CTable from "../components/CTable";
import { Form, Input, Layout, Button, Modal, Select, Card } from "antd";

import { openNotificationWithIcon } from "../components/common/notification";
import { shipperURL } from "../utils/constants";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "../components/common/CustomButton";
import ShipperRegisterModal from "../features/shipper/register.modal";
import DeleteModal from "../components/common/delete.modal";

import $lang from "../utils/content/jp.json";
import { API } from "../utils/helper";

const { Content } = Layout;

const ShipperList = ({ is_edit }) => {
  const [isposted, setIsPosted] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false);
  const [handleId, setHandleId] = useState("");

  const [allData, setAllData] = useState([]);

  const getShpperList = () => {
    API.get(`${shipperURL}`).then((res) => {
      let index = 1;
      const shipperData = res.data.map((item) => {
        return {
          ...item,
          key: index++,
        };
      });
      setAllData(shipperData);
    });
  };

  const handleRegister = (data) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createShipper(data);
    } else {
      updateShipper(data);
    }
  };

  const createShipper = (data) => {
    API.post(shipperURL, data)
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

  const updateShipper = (data) => {
    API.put(`${shipperURL}/${data.id}`, data)
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

  const handleShowDeleteModal = () => {
    setIsDeletedModalVisible(true);
  };

  const handleHideDeleteModal = () => {
    setIsDeletedModalVisible(false);
  };

  const handleDelete = (deltedId) => {
    API.delete(`${shipperURL}/${deltedId}`)
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
          $lang.popConfirmType.error,
          err.message
        );
      });
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    getShpperList();
  }, [isposted]);

  const shipperListColumns = [
    {
      title: `${$lang.no}`,
      dataIndex: "key",
      align: "center",
      // width: "8%",
    },
    {
      title: `${$lang.code}`,
      key: "code",
      dataIndex: "code",
      align: "center",
      // width: "15%",
    },
    {
      title: `${$lang.shipperName}`,
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
    {
      title: `${$lang.mainAddress}`,
      dataIndex: "main_address",
      key: "main_address",
      align: "center",
      render: (text, record, dataIndex) => {
        return (
          <div>
            {record.main_address.slice(0, 18)}
            {text.length >= 18 ? "..." : ""}
          </div>
        );
      },
    },
    {
      title: `${$lang.telNumber}`,
      dataIndex: "tel",
      key: "tel",
      align: "center",
      render: (text, record, dataIndex) => {
        return (
          <div>
            {record.tel.slice(0, 18)}
            {text.length >= 18 ? "..." : ""}
          </div>
        );
      },
    },
    {
      title: `${$lang.closingDate}`,
      dataIndex: "closing_date",
      key: "closing_date",
      align: "center",
      // width: "10%",
    },
    is_edit === 1 ? (
      {
        title: `${$lang.change}`,
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
                  title={$lang.change}
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
                  title={$lang.delete}
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
              <ShipperRegisterModal
                isOpen={isModalVisible}
                onClose={handleHideModal}
                onSave={handleRegister}
                initialValues={modalData}
              />
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
                columns={shipperListColumns}
                pagination={true}
              />
            </div>
          </div>
        </Card>
      </Content>
    </div>
  );
};
export default ShipperList;

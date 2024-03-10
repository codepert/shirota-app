import React, { useState, useEffect } from "react";
import axios from "axios";
import CTable from "../components/CTable";
import { feeUrl } from "../utils/constants";
import { warehouseFeeURL } from "../utils/constants";

import {
  Form,
  Input,
  Layout,
  Select,
  Button,
  Modal,
  notification,
  Card,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import CustomButton from "../components/common/CustomButton";
import WarehouseFeeRegisterModal from "../features/warehouseFee/register.modal";
import DeleteModal from "../components/common/delete.modal";
import { openNotificationWithIcon } from "../components/common/notification";
import $lang from "../utils/content/jp.json";
import { API } from "../utils/helper";

const { Content } = Layout;

const WarehouseFeePage = ({ is_edit }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isposted, setIsPosted] = useState(false);
  const [allData, setAllData] = useState([]);
  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false);
  const [handleId, setHandleId] = useState("");

  const getWarehouseFeeList = () => {
    API.get(`${warehouseFeeURL}`).then((res) => {
      let index = 1;
      const feeData = res.data.map((item) => {
        return {
          ...item,
          key: index++,
        };
      });
      setAllData(feeData);
    });
  };
  const handleRegister = (data) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createWarehouseFee(data);
    } else {
      updateWarehouseFee(data);
    }
  };

  const createWarehouseFee = (data) => {
    API.post(warehouseFeeURL, data)
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

  const updateWarehouseFee = (data) => {
    API.put(`${warehouseFeeURL}/${data.id}`, data)
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
    API.delete(`${warehouseFeeURL}/${deltedId}`)
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

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const feeListColumns = [
    {
      title: "No",
      dataIndex: "key",
      align: "center",
      width: "8%",
    },
    {
      title: `${$lang.Maintenance.packing}`,
      key: "packaging",
      dataIndex: "packaging",
      align: "center",
      render: (text, record, dataIndex) => {
        return (
          <div>
            {record.packaging.slice(0, 18)}
            {text.length >= 18 ? "..." : ""}
          </div>
        );
      },
    },
    {
      title: `${$lang.Maintenance.handlingFeeUnitPrice}`,
      dataIndex: "handling_fee_rate",
      key: "handling_fee_rate",
      align: "center",
    },
    {
      title: `${$lang.Maintenance.storageFeeUnitPrice}`,
      dataIndex: "storage_fee_rate",
      key: "storage_fee_rate",
      align: "center",
    },
    {
      title: $lang.Maintenance.billingClass,
      dataIndex: "fee_category",
      key: "fee_category",
      align: "center",
      render: (text) => {
        return text == 1
          ? $lang.Maintenance.fullTimeRequest
          : $lang.Maintenance.firstBilling;
      },
    },
    is_edit === 1 ? (
      {
        title: `${$lang.buttons.change}`,
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

  useEffect(() => {
    getWarehouseFeeList();
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
            <div className="mt-2" style={{ marginLeft: "880px" }}>
              {is_edit === 1 ? (
                <Button
                  onClick={() => {
                    handleShowModal();
                    setModalData(null);
                  }}
                  className="px-5 btn-bg-black"
                >
                  {$lang?.Maintenance?.addNew}
                </Button>
              ) : (
                <div></div>
              )}
              <WarehouseFeeRegisterModal
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
                columns={feeListColumns}
                pagination={true}
              />
            </div>
          </div>
        </Card>
      </Content>
    </div>
  );
};
export default WarehouseFeePage;

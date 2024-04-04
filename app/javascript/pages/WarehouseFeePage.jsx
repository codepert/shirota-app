import React, { useState, useEffect } from "react";
import { warehouseFeeURL } from "../utils/constants";

import { Layout, Button, Card, Flex } from "antd";

import WarehouseFeeRegisterModal from "../features/warehouseFee/register.modal";
import WarehouseFeeTable from "../features/warehouseFee/index.table";

import DeleteModal from "../components/common/modal/delete.modal";
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
    API.get(warehouseFeeURL).then((res) => {
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

  const handleRegister = (data, form) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createWarehouseFee(data, form);
    } else {
      updateWarehouseFee(data, form);
    }
  };

  const createWarehouseFee = (data, form) => {
    API.post(warehouseFeeURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_register_warehouse_fee
        );
        handleHideModal();
        setIsPosted(!isposted);
        form.resetFields();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const updateWarehouseFee = (data, form) => {
    API.put(`${warehouseFeeURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_update_warehouse_fee
        );
        handleHideModal();
        setIsPosted(!isposted);
        form.resetFields();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const handleDelete = (deltedId) => {
    API.delete(`${warehouseFeeURL}/${deltedId}`)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_delete_warehouse_fee
        );
        setIsPosted(!isposted);
        handleHideDeleteModal();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const handleShowDeleteModal = () => {
    setIsDeletedModalVisible(true);
  };

  const handleHideDeleteModal = () => {
    setIsDeletedModalVisible(false);
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const editRow = (row) => {
    console.log("row", row);
    setModalData(row);
    handleShowModal();
  };

  const deleteRow = (row) => {
    handleShowDeleteModal();
    setHandleId(row.id);
  };

  useEffect(() => {
    getWarehouseFeeList();
  }, [isposted]);

  return (
    <Content
      style={{ margin: "120px 10% 30px 10%" }}
      className="mx-auto flex flex-col content-h"
    >
      <Card style={{ width: "100%" }} className="py-2 my-2" bordered={false}>
        <Flex
          justify="flex-end"
          style={{
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          {is_edit === 1 ? (
            <Button
              onClick={() => {
                setModalData({
                  id: undefined,
                  code: null,
                  packaging: null,
                  handling_fee_rate: null,
                  storage_fee_rate: null,
                  fee_category: null,
                });
                handleShowModal();
              }}
              className="px-5 btn-bg-black"
            >
              {$lang.addNew}
            </Button>
          ) : (
            <></>
          )}
        </Flex>
        <WarehouseFeeTable
          editRow={editRow}
          deleteRow={deleteRow}
          data={allData}
          isEdit={is_edit}
        />
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
      </Card>
    </Content>
  );
};
export default WarehouseFeePage;

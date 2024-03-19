import React, { useState, useEffect } from "react";
import { warehouseURL } from "../utils/constants";
import { Layout, Button, Card, Flex } from "antd";

import { openNotificationWithIcon } from "../components/common/notification";

import WarehouseRegisterModal from "../features/warehouse/register.modal";
import WarehouseTable from "../features/warehouse/index.table";
import DeleteModal from "../components/common/delete.modal";

import $lang from "../utils/content/jp.json";
import { API } from "../utils/helper";
const { Content } = Layout;

const WarehousePage = ({ is_edit }) => {
  const [isposted, setIsPosted] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false);
  const [handleId, setHandleId] = useState("");

  const [tableData, setTableData] = useState([]);

  const getWarehouseList = () => {
    API.get(warehouseURL).then((res) => {
      let index = 1;
      const warehouseData = res.data.map((item) => {
        return {
          ...item,
          key: index++,
        };
      });
      setTableData(warehouseData);
    });
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const handleRegister = (data) => {
    console.log("register data", data);
    if (data.id == null) {
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
          $lang.popConfirmType.error,
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

  const editRow = (row) => {
    setModalData(row);
    handleShowModal();
  };

  const deleteRow = (row) => {
    handleShowDeleteModal();
    setHandleId(row.id);
  };

  useEffect(() => {
    getWarehouseList();
  }, [isposted]);

  return (
    <Content style={{ margin: 20 }} className="mx-auto flex flex-col content-h">
      <Card
        style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
        className="py-2 my-2"
        bordered={false}
      >
        <Flex justify="flex-end" className="mb-5">
          {is_edit === 1 ? (
            <Button
              onClick={() => {
                setModalData({
                  id: null,
                  name: null,
                  packaging: null,
                  code: null,
                  handling_fee_rate: null,
                  storage_fee_rate: null,
                  fee_category: null,
                });
                handleShowModal();
              }}
              className="btn-bg-black"
            >
              {$lang?.Maintenance?.addNew}
            </Button>
          ) : (
            <></>
          )}
        </Flex>
        <WarehouseTable
          data={tableData}
          editRow={editRow}
          deleteRow={deleteRow}
          isEdit={is_edit}
        />
        <WarehouseRegisterModal
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
export default WarehousePage;

import React, { useState, useEffect } from "react";
import { Layout, Button, Card, Flex } from "antd";

import { openNotificationWithIcon } from "../components/common/notification";
import ShipperRegisterModal from "../features/shipper/register.modal";
import ShipperTable from "../features/shipper/index.table";
import DeleteModal from "../components/common/delete.modal";

import $lang from "../utils/content/jp.json";
import { API } from "../utils/helper";
import { shipperURL } from "../utils/constants";

const { Content } = Layout;

const ShipperList = ({ is_edit }) => {
  const [isposted, setIsPosted] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false);
  const [handleId, setHandleId] = useState("");

  const [allData, setAllData] = useState([]);

  const getShpperList = () => {
    API.get(shipperURL).then((res) => {
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

  const handleRegister = (data, form) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createShipper(data, form);
    } else {
      updateShipper(data, form);
    }
  };

  const createShipper = (data, form) => {
    API.post(shipperURL, data, form)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_register_shipper
        );
        handleHideModal();
        setIsPosted(!isposted);
        form.resetFields();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const updateShipper = (data, form) => {
    API.put(`${shipperURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_update_shipper
        );
        handleHideModal();
        setIsPosted(!isposted);
        form.resetFields();
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

  const handleDelete = (deltedId) => {
    API.delete(`${shipperURL}/${deltedId}`)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_delete_shipper
        );
        setIsPosted(!isposted);
        handleHideDeleteModal();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
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
    getShpperList();
  }, [isposted]);

  return (
    <Content
      style={{ margin: "120px 10% 30px 10%" }}
      className="mx-auto flex flex-col content-h"
    >
      <Card style={{ width: "100%" }} className="py-2 my-2" bordered={false}>
        <Flex
          justify="flex-end"
          className="mb-5"
          style={{
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          {is_edit === 1 ? (
            <Button
              onClick={() => {
                handleShowModal();
                setModalData({
                  id: undefined,
                  name: null,
                  code: null,
                  post_code: null,
                  main_address: null,
                  sub_address: null,
                  tel: null,
                  closing_date: null,
                });
              }}
              className="btn-bg-black"
            >
              {$lang.addNew}
            </Button>
          ) : (
            <></>
          )}
        </Flex>
        <ShipperTable
          editRow={editRow}
          deleteRow={deleteRow}
          data={allData}
          isEdit={is_edit}
        />{" "}
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
      </Card>
    </Content>
  );
};
export default ShipperList;

import React, { useState, useEffect } from "react";
import { Layout, Button, Card, Row, Col } from "antd";

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
          <Row style={{ marginBottom: 10 }}>
            <Col span={12}></Col>
            <Col span={12}>
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
                <></>
              )}
            </Col>
          </Row>
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
    </div>
  );
};
export default ShipperList;

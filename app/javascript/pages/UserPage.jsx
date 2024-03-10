import React, { useState, useEffect } from "react";

import { Layout, Card, Button, Row, Col, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import CustomButton from "../components/common/CustomButton";
import { openNotificationWithIcon } from "../components/common/notification";
import CTable from "../components/CTable";

import UserRegisterModal from "../features/user/register.modal";

import { userURL } from "../utils/constants";
import $lang from "../utils/content/jp.json";
import { API } from "../utils/helper";

const { Content } = Layout;

const UserPage = () => {
  const [userList, setUserList] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [modalData, setModalData] = useState(null);
  const [editMode, setEditMode] = useState("create");
  const [isPosted, setIsPosted] = useState(false);

  const tableColumns = [
    {
      title: $lang.no,
      dataIndex: "key",
      key: "key",
      render: (text) => <a>{text}</a>,
      width: "5%",
    },
    {
      title: $lang.username,
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    {
      title: $lang.loginId,
      dataIndex: "login_id",
      key: "login_id",
      width: "20%",
    },
    {
      title: $lang.email,
      dataIndex: "email",
      key: "email",
      width: "20%",
    },
    {
      title: $lang.authority,
      dataIndex: "authority_name",
      key: "authority_name",
      width: "20%",
    },
    {
      title: "#",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <CustomButton
            onClick={() => {
              setModalData(record);
              setEditMode("update");
              handleShowModal();
            }}
            title={$lang.change}
            icon={<EditOutlined />}
            size="small"
            className="btn-default btn-hover-black"
            style={{ backgroundColor: "transparent", color: "#000" }}
            visability={true}
          />
        </Space>
      ),
    },
  ];

  const getUserList = () => {
    API.get(userURL).then((res) => {
      let index = 1;
      const users = res.data.map((item) => {
        return {
          ...item,
          key: index++,
        };
      });
      setUserList(users);
    });
  };

  const handleRegister = (data) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createUser(data);
    } else {
      updateUser(data);
    }
  };

  const createUser = (data) => {
    API.post(userURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        handleHideModal();
        setIsPosted(!isPosted);
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const updateUser = (data) => {
    API.put(`${userURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        handleHideModal();
        setIsPosted(!isPosted);
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const handleInitPassword = (userId) => {
    API.patch(`${userURL}/${userId}/inititialize_password`)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );

        handleHideModal();
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.error,
          err.message
        );
      });
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    getUserList();
  }, [isPosted]);

  return (
    <>
      <Content
        style={{ width: 1280, marginTop: 20 }}
        className="mx-auto flex flex-col justify-content content-h"
      >
        <Card
          style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
          className="py-4 my-2"
          bordered={false}
        >
          <Row style={{ marginBottom: 10 }}>
            <Col span={12}></Col>
            <Col span={12}>
              <Button
                onClick={() => {
                  handleShowModal();
                  setEditMode("create");
                  setModalData(null);
                }}
                style={{ float: "right" }}
              >
                {$lang.UserPage.buttons.addNew}
              </Button>
            </Col>
          </Row>
          <CTable
            rowKey={(node) => node.id}
            dataSource={userList}
            columns={tableColumns}
            pagination={true}
          />
          <UserRegisterModal
            isOpen={isModalVisible}
            onClose={handleHideModal}
            onSave={handleRegister}
            initialValues={modalData}
            editMode={editMode}
            onInitPassword={handleInitPassword}
          />
        </Card>
      </Content>
    </>
  );
};

export default UserPage;

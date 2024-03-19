import React, { useState, useEffect } from "react";

import { Layout, Card, Button, Flex } from "antd";

import UserRegisterModal from "../features/user/register.modal";
import UserTable from "../features/user/index.table";

import { openNotificationWithIcon } from "../components/common/notification";

import { userURL } from "../utils/constants";
import $lang from "../utils/content/jp.json";
import { API } from "../utils/helper";

const { Content } = Layout;

const UserPage = ({ is_edit }) => {
  const [userList, setUserList] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [modalData, setModalData] = useState(null);
  const [editMode, setEditMode] = useState("create");
  const [isPosted, setIsPosted] = useState(false);

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

  const editRow = (row) => {
    setModalData(row);
    setEditMode("update");
    handleShowModal();
  };

  useEffect(() => {
    getUserList();
  }, [isPosted]);

  return (
    <>
      <Content
        style={{ margin: 20 }}
        className="mx-auto flex flex-col justify-content content-h"
      >
        <Card style={{ width: "100%" }} bordered={false}>
          <Flex justify="flex-end">
            {is_edit === 1 ? (
              <Button
                onClick={() => {
                  handleShowModal();
                  setEditMode("create");
                  setModalData(null);
                }}
              >
                {$lang.UserPage.buttons.addNew}
              </Button>
            ) : (
              <></>
            )}
          </Flex>
          <UserTable editRow={editRow} data={userList} isEdit={is_edit} />
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

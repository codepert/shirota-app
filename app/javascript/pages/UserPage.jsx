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
          authority: item.user_authority.name,
          responsible_category: item.responsible_category.name,
        };
      });
      setUserList(users);
    });
  };

  const handleRegister = (data, form) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createUser(data, form);
    } else {
      updateUser(data, form);
    }
  };

  const createUser = (data, form) => {
    API.post(userURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_register_user
        );
        handleHideModal();
        setIsPosted(!isPosted);
        form.resetFields();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const updateUser = (data, form) => {
    API.put(`${userURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_update_user
        );
        handleHideModal();
        setIsPosted(!isPosted);
        form.resetFields();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const handleInitPassword = (userId) => {
    API.patch(`${userURL}/${userId}/inititialize_password`)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_change_user_passowrd
        );
        handleHideModal();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
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
        style={{ margin: "120px 10% 30px 10%" }}
        className="mx-auto flex flex-col justify-content content-h"
      >
        <Card style={{ width: "100%" }} bordered={false}>
          <Flex justify="flex-end" style={{ marginBottom: 10 }}>
            {is_edit === 1 ? (
              <Button
                onClick={() => {
                  handleShowModal();
                  setEditMode("create");
                  setModalData({
                    id: undefined,
                    email: null,
                    name: null,
                    login_id: null,
                    user_authority_id: null,
                    responsible_category_id: null,
                    password: null,
                    repassword: null,
                  });
                }}
              >
                {$lang.addNew}
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

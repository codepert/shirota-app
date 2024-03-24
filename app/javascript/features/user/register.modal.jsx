import React, { useState, useEffect } from "react";
import { Form, Modal, Input, Button, Select } from "antd";
import { userAuthURL } from "../../utils/constants";
import { API } from "../../utils/helper";
import $lang from "../../utils/content/jp.json";

const UserRegisterModal = ({
  isOpen,
  onClose,
  onSave,
  initialValues,
  editMode,
  onInitPassword,
}) => {
  const [form] = Form.useForm();
  const [authorityOptions, setAuthorityOptions] = useState([]);

  const getAuthorities = () => {
    API.get(userAuthURL).then((res) => {
      let index = 1;
      const auth = res.data.map((item) => {
        return {
          key: index++,
          value: item.id,
          label: item.name,
        };
      });

      setAuthorityOptions(auth);
    });
  };

  useEffect(() => {
    getAuthorities();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        onSave(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title={$lang.registerUser}
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        // layout="vertical"
        labelCol={{ span: 7 }}
        labelAlign="left"
      >
        <Form.Item name="id" style={{ height: 0 }}>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          name="name"
          label={$lang.username}
          rules={[{ required: true, message: $lang.messages.type_username }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={$lang.email}
          name={"email"}
          rules={[
            {
              type: "email",
              message: $lang.messages.invalid_email,
            },
            { required: true, message: $lang.messages.type_email },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="login_id"
          label={$lang.loginId}
          rules={[{ required: true, message: $lang.messages.type_loginId }]}
        >
          <Input />
        </Form.Item>
        {authorityOptions.length > 0 && (
          <Form.Item
            name="user_authority_id"
            label={$lang.authority}
            rules={[
              { required: true, message: $lang.messages.select_authority },
            ]}
          >
            <Select options={authorityOptions} allowClear />
          </Form.Item>
        )}
        {editMode == "create" && (
          <>
            {" "}
            <Form.Item
              label={$lang.password}
              name="password"
              rules={[
                {
                  required: true,
                  message: $lang.messages.type_password,
                },
                {
                  min: 6,
                  message: $lang.passwordLength,
                },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                  message: $lang.passwordPattern,
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label={$lang.confirm_password}
              name="repassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: $lang.messages.type_repassword,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error($lang.messages.no_matched_password)
                    );
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
          </>
        )}

        <div style={{ textAlign: "right" }}>
          <Button
            onClick={handleSave}
            style={{ marginRight: 10 }}
            type="primary"
          >
            {" "}
            {$lang.newResiger}
          </Button>
          <Button onClick={onClose} style={{ marginRight: "10px" }}>
            {$lang.cancel}
          </Button>
          {editMode == "update" && (
            <Button
              onClick={() => {
                onInitPassword(initialValues.id);
              }}
              type="primary"
              danger
            >
              {$lang.initPassword}
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};
export default UserRegisterModal;

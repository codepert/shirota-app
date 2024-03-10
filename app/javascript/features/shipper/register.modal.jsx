import React, { useEffect } from "react";
import { Form, Modal, Input, Button, Select } from "antd";
import $lang from "../../utils/content/jp.json";

const ShipperRegisterModal = ({ isOpen, onClose, onSave, initialValues }) => {
  const [form] = Form.useForm();

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
      title={$lang.shipperMaster}
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
          label={$lang.code}
          name={"code"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={$lang.shipperName}
          name={"name"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={$lang.postCode}
          name={"post_code"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={$lang.mainAddress}
          name={"main_address"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={$lang.subAddress} name={"sub_address"}>
          <Input />
        </Form.Item>
        <Form.Item
          label={$lang.telNumber}
          name={"tel"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={$lang.closingDate}
          name={"closing_date"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <Select
            options={[
              {
                key: 20,
                value: 20,
                label: "20",
              },
              {
                key: 28,
                value: 28,
                label: "28",
              },
              {
                key: 29,
                value: 29,
                label: "29",
              },
              {
                key: 30,
                value: 30,
                label: "30",
              },
              {
                key: 31,
                value: 31,
                label: "31",
              },
            ]}
          />
        </Form.Item>
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleSave} style={{ marginRight: 10 }}>
            {" "}
            {$lang.newResiger}
          </Button>
          <Button onClick={onClose} style={{ marginRight: "10px" }}>
            {$lang.cancel}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
export default ShipperRegisterModal;

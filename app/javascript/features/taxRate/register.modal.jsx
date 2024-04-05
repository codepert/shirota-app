import React, { useEffect } from "react";
import { Form, Modal, Input, Button, DatePicker } from "antd";
import $lang from "../../utils/content/jp.json";

const TaxRateRegisterModal = ({ isOpen, onClose, onSave, initialValues }) => {
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
        onSave(values, form);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title={$lang.tax_master}
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
          label={$lang.tax_date}
          name={"ab_date"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder={$lang.depositDate}
            format={"YYYY/MM/DD"}
          />
        </Form.Item>
        <Form.Item
          label={$lang.tax_type}
          name={"tax_type"}
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
          label={$lang.tax_rate}
          name={"tax_rate"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <Input type="number" />
        </Form.Item>
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
        </div>
      </Form>
    </Modal>
  );
};
export default TaxRateRegisterModal;

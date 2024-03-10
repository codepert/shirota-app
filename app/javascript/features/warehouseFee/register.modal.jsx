import React, { useEffect } from "react";
import { Form, Modal, Input, Button, Select } from "antd";
import $lang from "../../utils/content/jp.json";

const WarehouseFeeRegisterModal = ({
  isOpen,
  onClose,
  onSave,
  initialValues,
}) => {
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
      title={$lang.Maintenance.shipperMaster}
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
          label={$lang.Maintenance.packing}
          name={"packaging"}
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
          label={$lang.shipper.code}
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
          label={$lang.Maintenance.handlingFeeUnitPrice}
          name={"handling_fee_rate"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          label={$lang.Maintenance.storageFeeUnitPrice}
          name={"storage_fee_rate"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          label={$lang.Maintenance.billingClass}
          name={"fee_category"}
          rules={[
            {
              required: true,
              message: `${$lang.tableCommon.warning}`,
            },
          ]}
          initialValue={$lang.Maintenance.fullTimeRequest}
        >
          <Select
            options={[
              {
                value: 1,
                label: $lang.Maintenance.fullTimeRequest,
              },
              {
                value: 2,
                label: $lang.Maintenance.firstBilling,
              },
            ]}
            allowClear
          />
        </Form.Item>
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleSave} style={{ marginRight: 10 }}>
            {" "}
            {$lang.buttons.newResiger}
          </Button>
          <Button onClick={onClose} style={{ marginRight: "10px" }}>
            {$lang.buttons.cancel}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
export default WarehouseFeeRegisterModal;

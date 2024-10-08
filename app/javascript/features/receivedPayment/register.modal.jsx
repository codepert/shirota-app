import React, { useState, useEffect } from "react";
import { Form, Modal, Input, Button, Select, DatePicker } from "antd";
import dayjs from "dayjs";

import { shipperURL, dateFormat } from "../../utils/constants";
import { API } from "../../utils/helper";
import $lang from "../../utils/content/jp.json";

const ReceivedPaymentRegisterModal = ({
  isOpen,
  onClose,
  onSave,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [shippers, setShippers] = useState([]);

  const getShipperList = () => {
    API.get(shipperURL).then((res) => {
      let index = 1;
      const shippers = res.data.map((item) => {
        return {
          key: index++,
          value: item.id,
          label: item.name,
        };
      });

      setShippers(shippers);
    });
  };
  useEffect(() => {
    getShipperList();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
    }
  }, [initialValues]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        onSave(values, form);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title={$lang.receivePaymentRegister}
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
          name="shipper_id"
          label={$lang.shipperName}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <Select options={shippers} allowClear />
        </Form.Item>
        <Form.Item
          name="received_on"
          label={$lang.receivePaymentDate}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder={$lang.depositDate}
            format={"YYYY/MM/DD"}
          />
        </Form.Item>
        <Form.Item
          label={$lang.receivePaymentAmount}
          name={"amount"}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item name="description" label={$lang.receivePaymentDescription}>
          <Input />
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
export default ReceivedPaymentRegisterModal;

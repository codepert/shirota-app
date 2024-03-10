import React, { useState, useEffect } from "react";
import { Form, Modal, Input, Button, Select } from "antd";
import { warehouseFeeURL } from "../../utils/constants";
import { API } from "../../utils/helper";
import $lang from "../../utils/content/jp.json";

const ProductRegisterModal = ({ isOpen, onClose, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [warehouseFees, setWarehouseFees] = useState([]);

  const getWarehouseFees = () => {
    API.get(warehouseFeeURL).then((res) => {
      let index = 1;
      const priceData = res.data.map((item) => {
        return {
          ...item,
          // code: item.
          key: index++,
        };
      });
      const warehouseFees = priceData.map((item) => {
        return {
          value: item.id,
          label:
            item.packaging +
            " / " +
            $lang.ProductPage.handling_fee +
            " : " +
            item.handling_fee_rate +
            $lang.ProductPage.yen +
            " / " +
            $lang.ProductPage.storage_fee +
            " : " +
            item.storage_fee_rate +
            $lang.ProductPage.yen +
            " / " +
            "  " +
            (item.fee_category == 1
              ? $lang.WarehouseFeePage.fullTimeRequest
              : $lang.WarehouseFeePage.firstBilling),
        };
      });
      setWarehouseFees(warehouseFees);
    });
  };

  useEffect(() => {
    getWarehouseFees();
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
      title={$lang.ProductPage.registerProduct}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
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
          name="code"
          label={$lang.ProductPage.productCode}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={$lang.ProductPage.productName}
          name={"name"}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="specification"
          label={$lang.ProductPage.productPacking}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <Input />
        </Form.Item>
        {warehouseFees.length > 0 && (
          <Form.Item
            name="warehouse_fee_id"
            label={$lang.ProductPage.warehouseFee}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Select options={warehouseFees} allowClear />
          </Form.Item>
        )}
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleSave} style={{ marginRight: 10 }}>
            {" "}
            {$lang.buttons.save}
          </Button>
          <Button onClick={onClose} style={{ marginRight: "10px" }}>
            {$lang.buttons.cancel}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductRegisterModal;

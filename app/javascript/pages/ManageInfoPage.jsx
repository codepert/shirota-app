import React, { useState, useEffect } from "react";
import { Form, Card, DatePicker, Input, Button, Select } from "antd";
import { manageInfoURL } from "../utils/constants";
import { API } from "../utils/helper";
import $lang from '../utils/content/jp.json'
import { openNotificationWithIcon } from '../../javascript/components/common/notification'

const ManageInfoPage = () => {
  const [manageInfo, setMangaeInfo] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    getManageInfo()
    if (manageInfo) {
      form.setFieldsValue(manageInfo);
    }
  }, [manageInfo]);


  const getManageInfo = () => {
    API.get(manageInfoURL)
      .then((res) => {
        setMangaeInfo(res.data)
      })
  }

  const onSave = (data) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createProduct(data);
    } else {
      updateProduct(data);
    }
  };

  const createProduct = (data) => {
    API.post(manageInfoURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const updateProduct = (data) => {
    API.put(`${manageInfoURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        onSave(values);
        form.setFieldsValue();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <div className="items-center">
      <Card style={{ width: "30%" }}>
        <Form
          form={form}
          labelCol={{ span: 10 }}
          labelAlign="left"
        >
          <Form.Item
            name="company_name"
            label={$lang.companyName}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="post_code"
            label={$lang.postCode}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <div className="flex flex-row">
            <Form.Item
              name="address1"
              label={$lang.mainAddress}
              rules={[{ required: true, message: $lang.tableCommon.warning }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="address2"
              label={$lang.subAddress}
              rules={[{ required: true, message: $lang.tableCommon.warning }]}
              style={{ marginLeft: 39 }}
            >
              <Input />
            </Form.Item>
          </div>
          <Form.Item
            name="representative"
            label={$lang.representative}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tel_number"
            label={$lang.telephoneNumber}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="fax_number"
            label={$lang.faxNumber}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <div className="flex flex-row">
            <Form.Item
              name="start_date"
              label={$lang.firstDate}
              rules={[{ required: true, message: $lang.tableCommon.warning }]}
            >
              <DatePicker style={{ marginLeft: 10 }} />
            </Form.Item>
            <Form.Item
              name="end_date"
              label={$lang.lastDate}
              rules={[{ required: true, message: $lang.tableCommon.warning }]}
              style={{ marginLeft: 25 }}
            >
              <DatePicker style={{ marginLeft: 10 }} />
            </Form.Item>
          </div>
          <Form.Item
            name="processing_year"
            label={$lang.processYear}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input type="number" min={1950} max={2100} />
          </Form.Item>
          <Form.Item
            name="processing_month"
            label={$lang.processMonth}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input type="number" min={1} max={12} />
          </Form.Item>
          <Form.Item
            name="installation_location"
            label={$lang.location}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={$lang.invoiceNumber}
            name={"invoice_number"}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="register_number"
            label={$lang.registrationNumber}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input type="number" min={0} />
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
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ManageInfoPage;



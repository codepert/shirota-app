import React, { useState, useEffect } from "react";
import { taxRateURL } from "../utils/constants";
import { Layout, Button, Card, Flex } from "antd";
import dayjs from "dayjs";
import { openNotificationWithIcon } from "../components/common/notification";

import TaxRateRegisterModal from "../features/taxRate/register.modal";
import TaxRateTable from "../features/taxRate/index.table";
import DeleteModal from "../components/common/modal/delete.modal";

import $lang from "../utils/content/jp.json";
import { API } from "../utils/helper";
const { Content } = Layout;

const TaxRatePage = ({ is_edit }) => {
  const [isposted, setIsPosted] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false);
  const [handleId, setHandleId] = useState("");

  const [tableData, setTableData] = useState([]);

  const getTaxRateList = () => {
    API.get(taxRateURL).then((res) => {
      let index = 1;
      const data = res.data.map((item) => {
        return {
          ...item,
          key: index++,
        };
      });
      setTableData(data);
    });
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const handleRegister = (data, form) => {
    data.ab_date = data.ab_date.format("YYYY-MM-DD");
    if (data.id == null) {
      createWarehouse(data, form);
    } else {
      updateWarehouse(data, form);
    }
  };

  const createWarehouse = (data, form) => {
    API.post(taxRateURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_register_tax_rate
        );
        handleHideModal();
        setIsPosted(!isposted);
        form.resetFields();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const updateWarehouse = (data, form) => {
    API.put(`${taxRateURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_update_tax_rate
        );
        handleHideModal();
        setIsPosted(!isposted);
        form.resetFields();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const handleDelete = (deltedId) => {
    API.delete(`${taxRateURL}/${deltedId}`)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_delete_tax_rate
        );
        setIsPosted(!isposted);
        handleHideDeleteModal();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const handleShowDeleteModal = () => {
    setIsDeletedModalVisible(true);
  };

  const handleHideDeleteModal = () => {
    setIsDeletedModalVisible(false);
  };

  const editRow = (row) => {
    setModalData({
      id: row.id,
      tax_type: row.tax_type,
      tax_rate: row.tax_rate,
      ab_date: row.ab_date
        ? dayjs.tz(new Date(row.ab_date), "Asia/Tokyo")
        : null,
    });
    handleShowModal();
  };

  const deleteRow = (row) => {
    handleShowDeleteModal();
    setHandleId(row.id);
  };

  useEffect(() => {
    getTaxRateList();
  }, [isposted]);

  return (
    <Content
      style={{
        margin: "120px 10% 30px 10%",
      }}
      className="mx-auto flex flex-col content-h"
    >
      <Card style={{ width: "100%" }} className="py-2 my-2" bordered={false}>
        <Flex
          justify="flex-end"
          style={{
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          {is_edit === 1 ? (
            <Button
              onClick={() => {
                setModalData({
                  id: undefined,
                  ab_date: null,
                  tax_type: null,
                  tax_rate: null,
                });
                handleShowModal();
              }}
              className="btn-bg-black"
            >
              {$lang.addNew}
            </Button>
          ) : (
            <></>
          )}
        </Flex>
        <TaxRateTable
          data={tableData}
          editRow={editRow}
          deleteRow={deleteRow}
          isEdit={is_edit}
        />
        <TaxRateRegisterModal
          isOpen={isModalVisible}
          onClose={handleHideModal}
          onSave={handleRegister}
          initialValues={modalData}
        />
        <DeleteModal
          isOpen={isDeletedModalVisible}
          onClose={handleHideDeleteModal}
          onDelete={handleDelete}
          deletedId={handleId}
        />
      </Card>
    </Content>
  );
};
export default TaxRatePage;

import React, { useState, useEffect } from "react";
import { Input, Layout, Card, Flex, Button } from "antd";

import { openNotificationWithIcon } from "../components/common/notification";
import ProductRegisterModal from "../features/product/register.modal";
import ProductTable from "../features/product/index.table";
import DeleteModal from "../components/common/delete.modal";
import $lang from "../utils/content/jp.json";
import { productURL } from "../utils/constants";
import { API } from "../utils/helper";

const { Content } = Layout;

const ProductPage = ({ is_edit }) => {
  const [searchText, setSearchText] = useState("");
  const [isposted, setIsPosted] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [productData, setProductData] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false);
  const [handleId, setHandleId] = useState("");

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setItemPerPage(pageSize);
  };

  const getProductList = () => {
    // setLoading(true);
    const urlParam = `${productURL}?page=${currentPage}&limit=${itemsPerPage}&keyword=${searchText}`;
    API.get(urlParam).then((res) => {
      let index = 1;
      let products = res.data.map((item) => {
        let feeData = item.warehouse_fee;
        return {
          id: item.id,
          key: index++,
          name: item.name,
          packaging: feeData.packaging,
          storage_fee_rate: feeData.storage_fee_rate,
          handling_fee_rate: feeData.handling_fee_rate,
          fee_category: feeData.fee_category,
          code: item.code,
          specification: item.specification,
          warehouse_fee_id: feeData.id,
        };
      });
      setTotal(res.headers["x-total-count"]);
      setProductData(products);
    });
  };

  const handleSearchText = (e) => {
    setSearchText(e.target.value);
  };

  const handleRegister = (data) => {
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createProduct(data);
    } else {
      updateProduct(data);
    }
  };

  const createProduct = (data) => {
    API.post(productURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        handleHideModal();
        setIsPosted(!isposted);
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
    API.put(`${productURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        handleHideModal();
        setIsPosted(!isposted);
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.success,
          err.message
        );
      });
  };

  const handleShowDeleteModal = () => {
    setIsDeletedModalVisible(true);
  };

  const handleHideDeleteModal = () => {
    setIsDeletedModalVisible(false);
  };

  const handleDelete = (deltedId) => {
    API.delete(`${productURL}/${deltedId}`)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
        setIsPosted(!isposted);
        handleHideDeleteModal();
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.error,
          err.message
        );
      });
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const editRow = (row) => {
    setModalData(row);
    handleShowModal();
  };

  const deleteRow = (row) => {
    handleShowDeleteModal();
    setHandleId(row.id);
  };

  useEffect(() => {
    getProductList();
  }, [currentPage, itemsPerPage, isposted]);

  return (
    <Content style={{ margin: 20 }} className="mx-auto content-h">
      <Card
        style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
        className="py-2 my-2"
        bordered={false}
      >
        <Flex
          gap="middle"
          align="start"
          style={{
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <Flex
            style={{
              width: "100%",
            }}
            justify="space-between"
          >
            <div className="w-50">
              <Input
                value={searchText}
                placeholder={$lang.search}
                className="py-1 rounded-md box-shadow-none"
                onChange={handleSearchText}
                onPressEnter={(e) => {
                  if (e.keyCode === 13) {
                    setCurrentPage(0);
                    getProductList();
                  }
                }}
              />
            </div>
            {is_edit === 1 ? (
              <Button
                onClick={() => {
                  handleShowModal();
                  setModalData(null);
                }}
                className="btn-bg-black"
              >
                {$lang.addNew}
              </Button>
            ) : (
              <></>
            )}
          </Flex>
        </Flex>
        <ProductTable
          editRow={editRow}
          deleteRow={deleteRow}
          dataSource={productData}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          total={total}
          onChange={handlePageChange}
          isEdit={is_edit}
        />
        <ProductRegisterModal
          isOpen={isModalVisible}
          onClose={handleHideModal}
          onSave={handleRegister}
          initialValues={modalData}
          style={{ float: "right" }}
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
export default ProductPage;

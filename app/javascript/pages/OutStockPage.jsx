import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Select,
  Space,
  Input,
  DatePicker,
  Divider,
  Card,
  Row,
  Col,
} from "antd";
import {
  warehouseURL,
  shipperURL,
  productStockURL,
  saveStockOutUrl,
} from "../utils/constants";

import { Content } from "antd/es/layout/layout";
import { dateFormat } from "../utils/constants";

import CustomButton from "../components/common/CustomButton";
import { openNotificationWithIcon } from "../components/common/notification";
import ConfirmModal from "../components/modal/confirm.modal";

import OutStockTable from "../features/outStock/index.table";
import { getDateStr, API } from "../utils/helper";
import $lang from "../utils/content/jp.json";

const OutStockPage = ({ is_edit }) => {
  const [editMode, setEditMode] = useState("new");

  // ---------Warehouse--------
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  // ------------Shipper-----------
  const [shipperOptions, setShipperOptions] = useState([]);
  const [selectedShipperId, setSelectedShipperId] = useState("");
  const [shipperDisctription, setShipperDescription] = useState({
    code: "",
    closingDate: "",
  });
  // ---------product----------

  const [outStockDate, setOutStockDate] = useState("");

  // -----------packing---------
  const [packaging, setPackaging] = useState("");

  // --------storagePrice-------
  const [storagePrice, setStoragePrice] = useState("");

  // ----------handlePrice------------
  const [handlePrice, setHandlePrice] = useState("");

  const [inStockDate, setInStockDate] = useState("");

  // ---------------outStockAmount---------------
  const [outStockAmount, setOutStockAmount] = useState("");

  // -------------amount--------------
  const [stockAmount, setStockAmount] = useState("");

  const [prepareProducts, setPrepareProducts] = useState([]);

  const [searchProductTxt, setSearchProductTxt] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedStockInoutId, setSelectedStockInoutId] = useState("");
  const [stockInoutOptions, setStockInoutOptions] = useState([]);
  const [isModalVisible, setIsConfirmModalVisible] = useState(false);

  const initWarehouseFee = () => {
    setPackaging("");
    setStoragePrice("");
    setHandlePrice("");
    setInStockDate("");
    setStockAmount("");
  };
  //  -------init prepareProductItem--------
  const initPrepareProductItem = () => {
    setOutStockAmount("");
  };

  const getWarehouses = () => {
    API.get(warehouseURL)
      .then((res) => {
        const warehouses = res.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });

        setWarehouseOptions(warehouses);
        if (warehouses.length > 0) setSelectedWarehouseId(warehouses[0].value);
      })
      .catch((err) => {});
  };

  // --------Get shipper data--------
  const getShippers = () => {
    API.get(shipperURL)
      .then((res) => {
        const shippers = res.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
            code: item.code,
            closingDate: item.closing_date,
          };
        });
        setShipperOptions(shippers);

        if (shippers.length > 0) {
          setSelectedShipperId(shippers[0].value);

          setShipperDescription({
            code: shippers[0].code,
            closingDate: shippers[0].closingDate,
          });
        }
      })
      .catch((err) => {});
  };

  // --------Get product data--------
  const getProduct = () => {
    const url = `${productStockURL}?q=${searchProductTxt}&warehouse_id=${selectedWarehouseId}&shipper_id=${selectedShipperId}`;
    API.get(url).then((res) => {
      if (res.data.product.length > 0) {
        const product = res.data.product[0];
        const warehouseFee = res.data.product[0].warehouse_fee;

        setPackaging(warehouseFee.packaging);
        setSearchProductTxt(product.name);
        setSelectedProductId(product.id);
        setStoragePrice(warehouseFee.storage_fee_rate);
        setHandlePrice(warehouseFee.handling_fee_rate);

        const instocks = res.data.in_stock.map((item, i) => {
          return {
            value: item.id,
            label: item.lot_number,
            stock_id: item.stock_id,
            inout_on: item.inout_on,
            amount: item.amount,
            weight: item.weight,
            lot_number: item.lot_number,
          };
        });

        setStockInoutOptions(instocks);
        setSelectedStockInoutId(instocks[0].value);
      } else {
        openNotificationWithIcon(
          "warning",
          $lang.popConfirmType.warning,
          $lang.messages.not_register_or_in_stock
        );
      }
    });
  };

  const isReadyPrepareProducts = () => {
    if (selectedStockInoutId == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.input_product_name
      );
      return false;
    }
    if (outStockDate == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.input_out_stock_date
      );
      return false;
    }
    if (outStockAmount == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.input_out_amount
      );
      return false;
    }
    if (outStockAmount > stockAmount) {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.stockAmountError
      );

      return false;
    }

    return true;
  };

  const doPrepareProducts = () => {
    if (!isReadyPrepareProducts()) return;
    let selectedStockInoutArr = prepareProducts.slice();
    const outStockDateStr = outStockDate.format("YYYY/MM/DD");

    const stockInout = stockInoutOptions.filter(
      (item) => item.value == selectedStockInoutId
    )[0];

    const selectedWarehouse = warehouseOptions.filter(
      (item) => (item.value = selectedWarehouseId)
    )[0];
    const selectedShipper = shipperOptions.filter(
      (item) => item.value == selectedShipperId
    )[0];

    const newTableRecordData = {
      //main data
      index: selectedStockInoutArr.length + 1,
      product_name: searchProductTxt,
      packaging: packaging,
      lot_number: stockInout.lot_number,
      stock_amount: stockAmount,
      amount: outStockAmount,
      weight: stockInout.weight,
      //asset data
      warehouse_name: selectedWarehouse.label,
      shipper_name: selectedShipper.label,
      inout_on: outStockDateStr,
      in_stock_date: inStockDate,
      // memory data
      stock_id: stockInout.stock_id,
      stock_inout_id: stockInout.value,
      warehouse_id: selectedWarehouse.value,
      shipper_id: selectedShipper.value,
      handling_fee_rate: handlePrice,
      storage_fee_rate: storagePrice,
      category: 1,
    };

    selectedStockInoutArr.push(newTableRecordData);
    setPrepareProducts(selectedStockInoutArr);
    initPrepareProductItem();
    setStockAmount(stockAmount - outStockAmount);
  };

  const EditPrepareProduct = (rowId) => {
    const oldData = prepareProducts.slice();
    const editData = oldData.filter((item, i) => i == rowId)[0];

    if (editData.warehouse_id != selectedWarehouseId) {
      setSelectedWarehouseId(editData.warehouse_id);
    }

    if (editData.shipper_id != selectedShipperId) {
      setSelectedShipperId(editData.shipper_id);
    }

    if (editData.stock_inout_id != selectedStockInoutId) {
      setSelectedStockInoutId(editData.stock_inout_id);
    }

    setPrepareProductItem(editData);
    setEditMode("edit");
  };

  const setPrepareProductItem = (editData) => {
    // setStock(editData.stock_amount);
    setSearchProductTxt(editData.product_name);
    setInStockDate(editData.in_stock_date);
    setOutStockAmount(editData.amount);
    // setOutStockDate(moment(new Date(editData.inout_on)));
    setOutStockDate(dayjs.tz(new Date(editData.inout_on), "Asia/Tokyo"));
    setPackaging(editData.packaging);
    setHandlePrice(editData.handling_fee_rate);
    setStoragePrice(editData.storage_fee_rate);

    setStockAmount(stockAmount * 1 + editData.amount * 1);

    setStockInoutOptions([
      {
        value: editData.stock_inout_id,
        label: editData.lot_number,
        stock_id: editData.stock_id,
        inout_on: editData.inout_on,
        amount: editData.amount,
        weight: editData.weight,
        lot_number: editData.lot_number,
      },
    ]);
  };

  const updatePrepareProduct = () => {
    let oldData = prepareProducts.slice();
    const updateData = oldData.filter(
      (item) => item.stock_inout_id == selectedStockInoutId
    )[0];

    updateData.amount = outStockAmount;
    updateData.handling_fee_rate = handlePrice;
    // updateData.outstock_date = dayjs
    //   .tz(new Date(outStockDate), "Asia/Tokyo")
    //   .format(dateFormat);

    setPrepareProducts(oldData);
    setEditMode("new");
    setStockAmount(stockAmount - outStockAmount);
  };

  const handleSearchProduct = (e) => {
    setSearchProductTxt(e.target.value);
  };

  const cancelEditProduct = () => {
    setEditMode("new");
    setOutStockAmount("");
    getProduct();
  };

  const deletePrepareProduct = (rowId) => {
    EditPrepareProduct(rowId);

    const newData = prepareProducts.slice();
    const delData = newData.filter((item, i) => i == rowId)[0];

    const idx = newData.indexOf(delData);
    newData.splice(idx, 1);
    setPrepareProducts(newData);
    setEditMode("new");
    setOutStockAmount(0);
    getProduct();
  };

  const savePrepareProducts = () => {
    if (prepareProducts.length == 0) {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.empty_out_stock_data
      );
      return;
    }
    console.log(prepareProducts);
    API.post(saveStockOutUrl, { data: prepareProducts })
      .then((res) => {
        setPrepareProducts([]);
        initPrepareProductItem();
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.error,
          err.messages
        );
      });
  };

  const onChangeWarehouse = (value) => {
    setSelectedWarehouseId(value);
  };

  const onChangeShipper = (value) => {
    setSelectedShipperId(value);
  };

  const handleHideConfirmModal = () => {
    setIsConfirmModalVisible(false);
  };

  useEffect(() => {
    if (warehouseOptions.length == 0) {
      getWarehouses();
    }

    if (shipperOptions.length == 0) {
      getShippers();
    }
  }, []);

  useEffect(() => {
    const shipper = shipperOptions.filter(
      (item) => item.value == selectedShipperId
    );
    setShipperDescription({
      code: shipper.length > 0 ? shipper[0].code : "",
      closingDate: shipper.length > 0 ? shipper[0].closingDate : "",
    });
  }, [selectedShipperId]);

  useEffect(() => {
    if (selectedStockInoutId != "") {
      const selected = stockInoutOptions.filter(
        (item) => item.value == selectedStockInoutId
      )[0];

      setInStockDate(selected.inout_on.replace(/\-/g, "/"));
      setStockAmount(selected.amount);
    }
  }, [selectedStockInoutId]);

  return (
    <div>
      <Content
        style={{ width: 1280, marginTop: 20 }}
        className="mx-auto flex flex-col justify-content content-h"
      >
        <Card
          style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
          className="py-2 my-2"
          bordered={false}
        >
          <Row className="my-2">
            <Col span={1}>
              <label>{$lang.warehouseName}: </label>
            </Col>
            <Col span={6}>
              <Select
                placeholder={$lang.warehouseName}
                style={{ width: 150, marginLeft: 14 }}
                value={selectedWarehouseId}
                options={warehouseOptions}
                onChange={onChangeWarehouse}
                disabled={editMode == "edit"}
              />
            </Col>
          </Row>
          <Row className="my-2">
            <Col span={1}>
              <label>{$lang.inStock.shipper}:</label>
            </Col>
            <Col span={6}>
              <Select
                style={{ width: 300, marginLeft: 14 }}
                onChange={onChangeShipper}
                options={shipperOptions}
                value={selectedShipperId}
                defaultValue={""}
                placeholder={$lang.inStock.shipper}
                disabled={editMode == "edit"}
              />
              {shipperOptions.length > 0 && (
                <span className="" style={{ marginLeft: 16 }}>
                  {$lang.inStock.shipper} :&nbsp;&nbsp;
                  {shipperDisctription.code} &nbsp;/ &nbsp;
                  {shipperDisctription.closingDate}
                </span>
              )}{" "}
            </Col>
          </Row>
          <Row className="my-2">
            <Col span={1}>
              <label>{$lang.outStock.outStockDate}:</label>
            </Col>
            <Col span={6}>
              <div className="ml-2">
                <DatePicker
                  style={{ width: 150 }}
                  value={outStockDate}
                  onChange={(date, dt) => {
                    if (dt == "") {
                      setOutStockDate(dayjs(currentDate, dateFormat));
                    } else {
                      setOutStockDate(dayjs(date, dateFormat));
                    }
                  }}
                  placeholder={$lang.outStock.outStockDate}
                  className="ml-1"
                  format={dateFormat}
                />
              </div>
            </Col>
          </Row>
          <Row className="my-2">
            <Col span={1}>
              <label>{$lang.inStock.productName}:</label>
            </Col>
            <Col span={16}>
              <Space.Compact block className="ml-3">
                <Input
                  style={{ width: 150 }}
                  placeholder={$lang.inStock.productName}
                  value={searchProductTxt}
                  onChange={handleSearchProduct}
                  onPressEnter={(e) => {
                    if (e.keyCode === 13) {
                      getProduct();
                    }
                  }}
                />
                <Input
                  style={{ width: 150 }}
                  placeholder={$lang.inStock.packing}
                  value={packaging}
                  disabled
                />
                <Input
                  style={{ width: 100 }}
                  placeholder={$lang.inStock.cargoPrice}
                  value={handlePrice}
                  onChange={(e) => {
                    setHandlePrice(e.target.value);
                  }}
                />
                <Input
                  style={{ width: 100 }}
                  placeholder={$lang.inStock.storagePrice}
                  value={storagePrice}
                  disabled
                />
              </Space.Compact>
            </Col>
          </Row>
          <Row>
            <Col span={1}></Col>
            <Col span={5} style={{ display: "flex" }}>
              <Space.Compact block className="ml-3">
                <Input
                  style={{ width: 100 }}
                  placeholder={$lang.inStock.inStockDate}
                  value={inStockDate}
                  disabled
                />
                <Select
                  placeholder={$lang.inStock.lotNumber}
                  style={{ width: 150 }}
                  value={selectedStockInoutId}
                  options={stockInoutOptions}
                  onChange={(v) => {
                    setSelectedStockInoutId(v);
                  }}
                  disabled={editMode == "edit"}
                />
              </Space.Compact>
              <Space.Compact className="ml-3">
                <Input
                  type="number"
                  style={{ width: 100 }}
                  placeholder={$lang.outStock.stockAmount}
                  value={stockAmount}
                  disabled
                />
                <Input
                  style={{ width: 100 }}
                  type="number"
                  placeholder={$lang.outStock.outStockAmount}
                  value={outStockAmount}
                  onChange={(e) => {
                    setOutStockAmount(e.target.value);
                  }}
                />
              </Space.Compact>
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={1}></Col>
            {is_edit === 1 ? (
              <Col span={6}>
                <CustomButton
                  onClick={doPrepareProducts}
                  className="px-5 ml-2 btn-bg-black"
                  title={$lang.buttons.add}
                  htmlType="submit"
                  visability={editMode != "edit"}
                />
                <CustomButton
                  onClick={updatePrepareProduct}
                  className="px-5 ml-2 btn-bg-black"
                  title={$lang.buttons.change}
                  visability={editMode == "edit"}
                />
                <CustomButton
                  onClick={cancelEditProduct}
                  className="px-5 ml-2 default"
                  title={$lang.buttons.cancel}
                  visability={editMode == "edit"}
                />
              </Col>
            ) : (
              <></>
            )}
          </Row>
        </Card>
        <Card
          style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
          className="py-4 my-2"
          bordered={false}
        >
          <OutStockTable
            data={prepareProducts}
            editRow={(key) => EditPrepareProduct(key)}
            deleteRow={deletePrepareProduct}
            pagination={false}
            is_edit={is_edit}
          />
          <div
            style={{
              justifyContent: "flex-end",
              display: "flex",
              marginTop: 15,
            }}
          >
            {is_edit === 1 ? (
              <>
                <CustomButton
                  onClick={setIsConfirmModalVisible}
                  title={$lang.confirmDeparture}
                  visability={true}
                ></CustomButton>

                <ConfirmModal
                  isOpen={isModalVisible}
                  onConfirm={() => {
                    handleHideConfirmModal();
                    savePrepareProducts();
                  }}
                  onClose={handleHideConfirmModal}
                  message={$lang.messages.confirm_outstock}
                />
              </>
            ) : (
              <></>
            )}
          </div>
        </Card>
      </Content>
    </div>
  );
};

export default OutStockPage;

const baseUrl = "http://127.0.0.1:3000/";
// const baseUrl = "http://160.16.75.49/";

export const loginURL = baseUrl + "login";

export const signupURL = baseUrl + "signup";

export const secretsURL = baseUrl + "secrets";

export const verifyAuthURL = baseUrl + "verify";

export const logoutURL = baseUrl + "logout";

export const warehouseURL = baseUrl + "api/v1/warehouses";

export const shipperURL = baseUrl + "api/shipper";

export const productURL = baseUrl + "api/product";

export const productSetUrl = baseUrl + "api/product_set";

export const warehouseFeeURL = baseUrl + "api/v1/warehouse_fee";

export const navigatiionsURL = baseUrl + "api/v1/pages";

export const productDetailURL = (id) => baseUrl + `api/product_detail?id=${id}`;
export const productStockURL = baseUrl + `api/product_stock`;

export const saveStockInoutUrl = baseUrl + "api/stock_inout";
export const saveStockOutUrl = baseUrl + "api/stock_out";

export const exportCSVDataUrl = baseUrl + "api/export_instock_csv";

export const exportInventoryPdfDataUrl = baseUrl + "api/inventory_export_pdf";

export const exportStockCSVDataUrl = baseUrl + "api/export_stock_csv";

export const inventoryURL = baseUrl + "api/stock";

//unit_price urls

export const feeUrl = baseUrl + "api/warehouse_fee";

export const receivedPaymentURL = baseUrl + "api/received_payment";

export const getUserURL = baseUrl + "api/user";

export const getUserAuthURL = baseUrl + "api/authorities";

export const getClientPageURL = baseUrl + "api/client_page";

export const getAuthDataURL = baseUrl + "api/get_all_auth_data";

export const setAuthDataURL = baseUrl + "api/set_auth_data";
export const exportDepositCSVDataUrl = baseUrl + "api/received_payment_csv";
//unit_price urls

export const httpErrors = {
  400: "Bad Request",
  401: "Unauthorized",
  404: "Not Found",
  default: "Internal Server Error",
};

export const dateFormat = "YYYY/MM/DD";

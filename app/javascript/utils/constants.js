const baseUrl = "http://127.0.0.1:3000/";
// const baseUrl = "http://160.16.75.49/";

export const loginURL = baseUrl + "login";

export const signupURL = baseUrl + "signup";

export const secretsURL = baseUrl + "secrets";

export const verifyAuthURL = baseUrl + "verify";

export const logoutURL = baseUrl + "logout";

export const warehouseURL = baseUrl + "api/v1/warehouses";

export const shipperURL = baseUrl + "api/v1/shippers";

export const productURL = baseUrl + "api/v1/products";

export const productSetUrl = baseUrl + "api/product_set";

export const warehouseFeeURL = baseUrl + "api/v1/warehouse_fees";

export const navigatiionsURL = baseUrl + "api/v1/pages";

export const productDetailURL = baseUrl + `api/v1/products_by`;

export const productStockURL = baseUrl + `api/v1/product_in_stock`;

export const saveStockInUrl = baseUrl + "api/v1/stock_in";
export const saveStockOutUrl = baseUrl + "api/v1/stock_out";

export const exportCSVDataUrl = baseUrl + "api/v1/stock_in_csv_export";

export const exportInventoryPdfDataUrl = baseUrl + "api/inventory_export_pdf";

export const exportStockCSVDataUrl = baseUrl + "api/export_stock_csv";

export const inventoryURL = baseUrl + "api/v1/stock_inouts";

//unit_price urls

export const feeUrl = baseUrl + "api/warehouse_fee";

export const receivedPaymentURL = baseUrl + "api/received_payment";

export const userURL = baseUrl + "api/v1/users";

export const userAuthURL = baseUrl + "api/v1/user_authorities";

export const pageURL = baseUrl + "api/v1/pages";
export const authorityPageURL = baseUrl + "api/v1/authority_pages";

export const setAuthorityPageURL = baseUrl + "api/v1/set_authority_pages";

export const exportDepositCSVDataUrl = baseUrl + "api/received_payment_csv";
//unit_price urls

export const httpErrors = {
  400: "Bad Request",
  401: "Unauthorized",
  404: "Not Found",
  default: "Internal Server Error",
};

export const dateFormat = "YYYY/MM/DD";

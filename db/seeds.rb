# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

Page.create!([
  {
    name: 'トップ',
    path: '/home',
  },{
    name: '入庫処理',
    path: '/stock_in',
  },{
    name: '出庫処理',
    path: '/stock_out',
  },{
    name: '在庫管理',
    path: '/stock',
  },{
    name: '入金処理',
    path: '/deposit',
  },{
    name: '請求一覧',
    path: '/bill_list',
  },{
    name: '請求処理',
    path: '/bill_process',
  },{
    name: '品名一覧',
    path: '/product',
  },{
    name: '荷主マスタ',
    path: '/shipper',
  },{
    name: '単価区分マスタ',
    path: '/warehouse_fee',
  },
  {
    name: '権限別ペジ管理',
    path: '/auth_permission',
  },
  {
    name: 'user管理',
    path: '/user_managent',
  },
])

UserAuthority.create([{
  id: 1,
  name: '入出庫の入力・編集のみ',
  auth_num: 1,
},{
  id: 2,
  name: '1＋請求書発行（締日処理）',
  auth_num: 2,
},{
  id: 7,
  name: 'admin',
  auth_num: 7,
},{
  id: 9,
  name: '2 + マスタ管理機能',
  auth_num: 9,
}])

WarehouseFee.create([
  {
    code: '22',
    packaging: 'C/Ｎ　10Kg以上',
    handling_fee_rate: '11',
    storage_fee_rate: '16',
    fee_category: 1,
  },
  {
    code: '1',
    packaging: 'C/N　10Kg以下',
    handling_fee_rate: '8',
    storage_fee_rate: '11',
    fee_category: 1,
  },
  {
    code: '2',
    packaging: 'C/S ',
    handling_fee_rate: '10',
    storage_fee_rate: '11',
    fee_category: 1,
  },
  {
    code: '3',
    packaging: 'C/S  加工油',
    handling_fee_rate: '11',
    storage_fee_rate: '16',
    fee_category: 1,
  },
  {
    code: '4',
    packaging: 'B/G ',
    handling_fee_rate: '12',
    storage_fee_rate: '15',
    fee_category: 1,
  },
  {
    code: '5',
    packaging: 'D/M ',
    handling_fee_rate: '110',
    storage_fee_rate: '180',
    fee_category: 1,
  },
  {
    code: '6',
    packaging: 'F/D ',
    handling_fee_rate: '50',
    storage_fee_rate: '100',
    fee_category: 1,
  },
  {
    code: '7',
    packaging: 'F/C  一般',
    handling_fee_rate: '205',
    storage_fee_rate: '305',
    fee_category: 1,
  },
  {
    code: '8',
    packaging: 'F/C　保冷品',
    handling_fee_rate: '205',
    storage_fee_rate: '305',
    fee_category: 1,
  },
  {
    code: '9',
    packaging: 'CNT  液',
    handling_fee_rate: '480',
    storage_fee_rate: '880',
    fee_category: 1,
  },
  {
    code: '10',
    packaging: 'C/S',
    handling_fee_rate: '5',
    storage_fee_rate: '12',
    fee_category: 2,
  },
  {
    code: '11',
    packaging: 'C/S',
    handling_fee_rate: '5',
    storage_fee_rate: '12',
    fee_category: 2,
  },
  {
    code: '12',
    packaging: 'ポリカン',
    handling_fee_rate: '5',
    storage_fee_rate: '12',
    fee_category: 2,
  },
  {
    code: '13',
    packaging: 'ビン(1.8ﾘｯﾄﾙ)',
    handling_fee_rate: '5',
    storage_fee_rate: '12',
    fee_category: 2,
  },
  {
    code: '14',
    packaging: 'F/C',
    handling_fee_rate: '320',
    storage_fee_rate: '300',
    fee_category: 1,
  },
  {
    code: '15',
    packaging: 'B/G',
    handling_fee_rate: '7',
    storage_fee_rate: '7',
    fee_category: 1,
  },
  {
    code: '16',
    packaging: '空F/D',
    handling_fee_rate: '20',
    storage_fee_rate: '90',
    fee_category: 1,
  },
  {
    code: '17',
    packaging: '空Ｆ/Ｄ',
    handling_fee_rate: '20',
    storage_fee_rate: '90',
    fee_category: 1,
  },
  {
    code: '18',
    packaging: 'B/G',
    handling_fee_rate: '12',
    storage_fee_rate: '15',
    fee_category: 1,
  },
  {
    code: '19',
    packaging: 'FD/M',
    handling_fee_rate: '50',
    storage_fee_rate: '100',
    fee_category: 1,
  },
  {
    code: '20',
    packaging: '袋',
    handling_fee_rate: '5',
    storage_fee_rate: '5',
    fee_category: 1,
  },
  {
    code: '21',
    packaging: 'P/T',
    handling_fee_rate: '500',
    storage_fee_rate: '700',
    fee_category: 1,
  },
])

Warehouse.create([{
  name: '一般倉庫'
},{
  name: '恒温倉庫'
},{
  name: '危険物倉庫'
}])

User.create([{
  name: 'warehouse',
  login_id: 'warehouse',
  user_authority_id: 7,
  email: 'warehouse@test.com',
  password: 'p@ssW0rd!'
}])


AuthorityPage.create([{
  user_authority_id: 7,
  page_id: 1,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 2,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 3,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 4,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 5,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 6,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 7,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 8,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 9,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 10,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 11,
  is_read: 1,
  is_edit: 1
},{
  user_authority_id: 7,
  page_id: 12,
  is_read: 1,
  is_edit: 1
},])
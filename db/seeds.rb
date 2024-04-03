# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Page.create!([
#   {
#     name: 'トップ',
#     path: '/home',
#   },{
#     name: '入庫処理',
#     path: '/stock_in',
#   },{
#     name: '出庫処理',
#     path: '/stock_out',
#   },{
#     name: '在庫管理',
#     path: '/stock',
#   },{
#     name: '入金処理',
#     path: '/receive_payment',
#   },{
#     name: '請求一覧',
#     path: '/bill_list',
#     parent_id: 16
#   },{
#     name: '請求処理',
#     path: '/bill_process',
#     parent_id: 16
#   },{
#     name: '品名一覧',
#     path: '/product',
#     parent_id: 14
#   },{
#     name: '荷主マスタ',
#     path: '/shipper',
#     parent_id: 14
#   },{
#     name: '倉庫マスタ',
#     path: '/warehouse',
#     parent_id: 14
#   },{
#     name: '単価区分マスタ',
#     path: '/warehouse_fee',
#     parent_id: 14
#   },
#   {
#     name: '権限別ペジ管理',
#     path: '/auth_permission',
#     parent_id: 15
#   },
#   {
#     name: 'ユーザー管理',
#     path: '/user_managent',
#     parent_id: 15
#   },
#   {
#     name: "マスタ管理",
#     path: "#/master",
#   },
#   {
#     name: "Administrator",
#     path: "#/admin",
#   },
#   {
#     name: "請求処理",
#     path: "#/bill",
#   },
#   {
#     name: "管理マスタ",
#     path: "/manage_master",
#     parent_id: 15
#   }
# ])

# UserAuthority.insert_all([{
#   name: '入出庫の入力・編集のみ',
#   auth_num: 1,
# },{
#   name: '1＋請求書発行（締日処理）',
#   auth_num: 2,
# },{
#   name: 'admin',
#   auth_num: 7,
# },{
#   name: '2 + マスタ管理機能',
#   auth_num: 9,
# }])

# WarehouseFee.create([
#   {
#     code: '22',
#     packaging: 'C/Ｎ　10Kg以上',
#     handling_fee_rate: '11',
#     storage_fee_rate: '16',
#     fee_category: 1,
#   },
#   {
#     code: '1',
#     packaging: 'C/N　10Kg以下',
#     handling_fee_rate: '8',
#     storage_fee_rate: '11',
#     fee_category: 1,
#   },
#   {
#     code: '2',
#     packaging: 'C/S ',
#     handling_fee_rate: '10',
#     storage_fee_rate: '11',
#     fee_category: 1,
#   },
#   {
#     code: '3',
#     packaging: 'C/S  加工油',
#     handling_fee_rate: '11',
#     storage_fee_rate: '16',
#     fee_category: 1,
#   },
#   {
#     code: '4',
#     packaging: 'B/G ',
#     handling_fee_rate: '12',
#     storage_fee_rate: '15',
#     fee_category: 1,
#   },
#   {
#     code: '5',
#     packaging: 'D/M ',
#     handling_fee_rate: '110',
#     storage_fee_rate: '180',
#     fee_category: 1,
#   },
#   {
#     code: '6',
#     packaging: 'F/D ',
#     handling_fee_rate: '50',
#     storage_fee_rate: '100',
#     fee_category: 1,
#   },
#   {
#     code: '7',
#     packaging: 'F/C  一般',
#     handling_fee_rate: '205',
#     storage_fee_rate: '305',
#     fee_category: 1,
#   },
#   {
#     code: '8',
#     packaging: 'F/C　保冷品',
#     handling_fee_rate: '205',
#     storage_fee_rate: '305',
#     fee_category: 1,
#   },
#   {
#     code: '9',
#     packaging: 'CNT  液',
#     handling_fee_rate: '480',
#     storage_fee_rate: '880',
#     fee_category: 1,
#   },
#   {
#     code: '10',
#     packaging: 'C/S',
#     handling_fee_rate: '5',
#     storage_fee_rate: '12',
#     fee_category: 2,
#   },
#   {
#     code: '11',
#     packaging: 'C/S',
#     handling_fee_rate: '5',
#     storage_fee_rate: '12',
#     fee_category: 2,
#   },
#   {
#     code: '12',
#     packaging: 'ポリカン',
#     handling_fee_rate: '5',
#     storage_fee_rate: '12',
#     fee_category: 2,
#   },
#   {
#     code: '13',
#     packaging: 'ビン(1.8ﾘｯﾄﾙ)',
#     handling_fee_rate: '5',
#     storage_fee_rate: '12',
#     fee_category: 2,
#   },
#   {
#     code: '14',
#     packaging: 'F/C',
#     handling_fee_rate: '320',
#     storage_fee_rate: '300',
#     fee_category: 1,
#   },
#   {
#     code: '15',
#     packaging: 'B/G',
#     handling_fee_rate: '7',
#     storage_fee_rate: '7',
#     fee_category: 1,
#   },
#   {
#     code: '16',
#     packaging: '空F/D',
#     handling_fee_rate: '20',
#     storage_fee_rate: '90',
#     fee_category: 1,
#   },
#   {
#     code: '17',
#     packaging: '空Ｆ/Ｄ',
#     handling_fee_rate: '20',
#     storage_fee_rate: '90',
#     fee_category: 1,
#   },
#   {
#     code: '18',
#     packaging: 'B/G',
#     handling_fee_rate: '12',
#     storage_fee_rate: '15',
#     fee_category: 1,
#   },
#   {
#     code: '19',
#     packaging: 'FD/M',
#     handling_fee_rate: '50',
#     storage_fee_rate: '100',
#     fee_category: 1,
#   },
#   {
#     code: '20',
#     packaging: '袋',
#     handling_fee_rate: '5',
#     storage_fee_rate: '5',
#     fee_category: 1,
#   },
#   {
#     code: '21',
#     packaging: 'P/T',
#     handling_fee_rate: '500',
#     storage_fee_rate: '700',
#     fee_category: 1,
#   },
# ])

ResponsibleCategory.create([{
  name: '本社	
'
},{
  name: '員弁	
'
}])

User.create([{
  name: 'systemadmin',
  login_id: 'systemadmin',
  user_authority_id: 3,
  email: 'warehouse@test.com',
  password: 'p@ssW0rd!',
  responsible_category_id: 1
}])


# AuthorityPage.create([{
#   user_authority_id: 3,
#   page_id: 1,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 2,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 3,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 4,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 5,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 6,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 7,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 8,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 9,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 10,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 11,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 12,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 13,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 14,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 15,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 16,
#   is_read: 1,
#   is_edit: 1
# },{
#   user_authority_id: 3,
#   page_id: 17,
#   is_read: 1,
#   is_edit: 1
# }])

ManagementInfo.create([{
  company_name: '城田運送株式会社',
  post_code: '511-0944',
  address1: '三重県桑名市',
  address2: '芳ヶ崎７７８',
  representative: '城田 真理子',
  tel_number: '0594-31-2532',
  fax_number: '2024-04-01',
  start_date: '2025-03-31',
  end_date: '1',
  processing_year: '2024',
  processing_month: '1',
  installation_location: '本社',
  management_pw: 'XXXX',
  invoice_number: '123456	',
  register_number: 'T1234567890123',
  bank: 'xxxxxx-xxxxxx',
  bank_number: '123'
}])

WarehouseCategory.create([{
  category: '11',
  lot: '1',
  storage_category: '一般'
},{
  category: '21',
  lot: '2',
  storage_category: '員弁一般'
},{
  category: '22',
  lot: '2',
  storage_category: '員弁危険物'
},{
  category: '31',
  lot: '3',
  storage_category: '平古原料'
},{
  category: '32',
  lot: '3',
  storage_category: '平古中間体'
},{
  category: '41',
  lot: '4',
  storage_category: '東員原料'
},{
  category: '42',
  lot: '4',
  storage_category: '東員中間体'
},{
  category: '51',
  lot: '5',
  storage_category: 'その他ドラム倉庫'
}])

class CreateManagementInfo < ActiveRecord::Migration[7.1]
  def change
    create_table :management_infos do |t|
      t.string  :company_name,                  comment: '社名'
      t.string  :post_code,                     comment: '郵便番号'
      t.string  :address1,                      comment: '住所１'
      t.string  :address2,                      comment: '住所２'
      t.string  :representative,                comment: '代表者'
      t.string  :tel_number,                    comment: '電話番号'
      t.string  :fax_number,                    comment: 'FAX番号	'
      t.date    :start_date,                    comment: '期首年月日'
      t.date    :end_date,                      comment: '期末年月日'
      t.string  :processing_year,               comment: '処理年'
      t.string  :processing_month,              comment: '処理月'
      t.string  :management_pw,                 comment: '管理PW'
      t.string  :installation_location,         comment: '設置場所'
      t.string  :invoice_number,                comment: '請求書番号'
      t.string  :register_number,               comment: '登録番号'
      t.string  :bank,                          comment: 'bank'
      t.string  :bank_number,                   comment: ''
      t.timestamps
    end
  end
end

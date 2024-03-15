class CreateBills < ActiveRecord::Migration[7.1]
  def change
    create_table :bills do |t|
      t.belongs_to :shipper,              null:false, comment: '荷主id'
      t.belongs_to :warehouse,            null:false, comment: '倉庫id'
      t.float :last_amount,               null:false, comment: '前回請求額'
      t.float :deposit_amount,            null:false, comment: '入金額'
      t.float :handling_cost,             null:false, comment: '荷役料'
      t.float :storage_cost,              null:false, comment: '保管料'
      t.float :current_amount,            null:false, comment: '今回請求額'
      t.float :tax,                       null:false, comment: '消費税'
      t.date  :duration_from,             null:false, comment: ''
      t.date  :duration_to,               null:false, comment: ''
      t.date  :billed_on,                 null:false, comment: '請求年月日'
      t.integer :closing_date,            null:false, comment: '締日'
      t.integer :billed,                  null:false, comment: '確定フラグ', limit: 1, default: 1 
      t.integer :printed,                 comment: '出力フラグ', limit: 1
      t.timestamps
    end
  end
end

class CreateReceivePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :receive_payments do |t|
      t.belongs_to :shipper,            null:false, comment: '荷主id'
      t.date :received_on,              null:false, comment: '入金日'
      t.integer :amount,                null:false, comment: '入金額'
      t.text :description,                          comment: '摘要'
      t.date :processing_on,                        comment: '処理日'
      t.integer :received,              null:false, comment: '入金済みかどうか', limit:1

      t.timestamps
    end
  end
end

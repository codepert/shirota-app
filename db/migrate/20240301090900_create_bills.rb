class CreateBills < ActiveRecord::Migration[7.1]
  def change
    create_table :bills do |t|
      t.belongs_to :shipper,              null:false, comment: '荷主id'
      t.belongs_to :warehouse,            null:false, comment: '倉庫id'
      t.date :billed_on,                  null:false, comment: '請求年月日'
      t.integer :closing_date,            null:false, comment: '締日'
      t.date :duration_from,              null:false, comment: '対象期間 From'
      t.date :duration_to,                null:false, comment: '対象期間 To'
      t.date :shipper_from,               null:false, comment: '対象荷主 From'
      t.date :shipper_to,                 null:false, comment: '対象荷主 To'
      t.integer :billed,                  null:false, comment: '請求したかどうか',        limit: 1 
      t.integer :printed,                 null:false, comment: '請求書を作成したかどうか', limit: 1
      t.timestamps
    end
  end
end

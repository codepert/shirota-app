class CreateWarehouseFees < ActiveRecord::Migration[7.1]
  def change
    create_table :warehouse_fees do |t|
      t.string :code,                 null: false, comment: '単価コード'
      t.string :packaging,            null: false, comment: '荷姿'
      t.integer :handling_fee_rate,   null: false, comment: '荷役料単価'
      t.integer :storage_fee_rate,    null: false, comment: '保管料単価'
      t.integer :fee_category,        null: false, comment: '請求区分', limit:1
      t.timestamps
    end
    add_index :warehouse_fees, :code, unique: true
  end
end

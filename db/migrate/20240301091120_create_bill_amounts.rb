class CreateBillAmounts < ActiveRecord::Migration[7.1]
  def change
    create_table :bill_amounts do |t|
      t.belongs_to :bill,                         null:false,  comment: '請求id'
      t.integer :product_id,                      null:false,  comment: '品番'
      t.string  :lot_number,                      null:false,  comment: 'lot number'
      t.integer :previous_stock_amount,           null:false,  comment: "前期繰起"
      t.integer :first_half_instock_amount,       null:false,  comment: "上期入庫"
      t.integer :first_half_outstock_amount,      null:false,  comment: "上期出庫"
      t.integer :mid_instock_amount,              null:false,  comment: "中期入庫"
      t.integer :mid_outstock_amount,             null:false,  comment: "中期出庫"
      t.integer :second_half_instock_amount,      null:false,  comment: "下期入庫"
      t.integer :second_half_outstock_amount,     null:false,  comment: "下期出庫"
      t.integer :current_stock_amount,            null:false,  comment: "当期残高"
      t.integer :total_inout_stock_amount,        null:false,  comment: "当期残高"
      t.integer :storage_fee_rate ,               null:false,  comment: "保管料単価"
      t.integer :instock_handle_fee_rate ,        null:false,  comment: "入庫荷役料単価"
      t.integer :outstock_handle_fee_rate ,       null:false,  comment: "出庫荷役料単価"
      t.timestamps
    end
  end
end

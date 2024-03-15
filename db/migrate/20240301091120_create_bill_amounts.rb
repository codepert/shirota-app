class CreateBillAmounts < ActiveRecord::Migration[7.1]
  def change
    create_table :bill_amounts do |t|
      t.belongs_to :bill,                         null:false,  comment: '請求id'
      t.integer :product_id,                      null:false,  comment: '品番'
      t.string  :lot_number,                      null:false,  comment: 'lot number'
      t.integer :previous_period_carryover,       comment: "前期繰起"
      t.integer :first_half_instock_amount,       comment: "上期入庫"
      t.integer :first_half_outstock_amount,      comment: "上期出庫"
      t.integer :mid_instock_amount,              comment: "中期入庫"
      t.integer :mid_outstock_amount,             comment: "中期出庫"
      t.integer :second_half_instock_amount,      comment: "下期入庫"
      t.integer :second_half_outstock_amount,     comment: "下期出庫"
      t.integer :current_period_balance,          comment: "当期残高"
      t.timestamps
    end
  end
end

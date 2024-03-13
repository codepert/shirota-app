class CreateBillAmounts < ActiveRecord::Migration[7.1]
  def change
    create_table :bill_amounts do |t|
      t.belongs_to :bill,                       null:false,  comment: '請求id'
      t.integer :product_id,                    null:false,  comment: '品番'
      t.integer :lot_number,                    null:false,  comment: 'ロット番号'
      t.integer :previous_period_carryover,     null:false,  comment: '前期繰越'
      t.integer :first_half_instock,            null:false,  comment: '上期入庫'
      t.integer :first_half_outstock,           null:false,  comment: '上期出庫'
      t.integer :mid_instock,                   null:false,  comment: '中期入庫'
      t.integer :mid_outstock,                  null:false,  comment: '中期出庫'
      t.integer :second_half_instock,          null:false,  comment: '下期入庫'
      t.integer :second_half_outstock,          null:false,  comment: '下期出庫'
      t.integer :product_count,                 null:false,  comment: '総積数'
      t.float :storage_fee_rate,                null:false,  comment: '保管単価'
      t.integer :instock_count,                 null:false,  comment: '入庫数'
      t.integer :outstock_count,                null:false,  comment: '出庫数'
      t.timestamps
    end
  end
end

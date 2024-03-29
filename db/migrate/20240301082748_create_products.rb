class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.string :name,                   null: false, comment: '品名'
      t.string :code,                   null: false, comment: '品名コード'
      t.references :warehouse_fee, null: false, comment: '単価 id', type: :bigint
      t.string :specification,          null: false, comment: '規格・荷姿'
      t.timestamps
    end
    add_index :products, :code                    
    add_index :products, :name
    add_index :products, :specification               
  end
end

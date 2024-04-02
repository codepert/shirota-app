class CreateWarehouseCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :warehouse_categories do |t|
      t.integer :category, null: false, comment: '倉庫区分'
      t.integer :lot, null: false, comment: '倉庫コード'
      t.string :storage_category, null: false, comment: '保管区分'
      t.timestamps
    end
  end
end

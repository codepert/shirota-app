class AddIsBilledToStockInouts < ActiveRecord::Migration[7.1]
  def change
    add_column :stock_inouts, :is_billed, :integer, limit: 1, default: 0
  end
end
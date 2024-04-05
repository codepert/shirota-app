class CreateTaxRates < ActiveRecord::Migration[7.1]
  def change
    create_table :tax_rates do |t|
      t.date :ab_date, null:false
      t.string :tax_type
      t.integer :tax_rate
      t.timestamps
    end
  end
end

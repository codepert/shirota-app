class CreateUserAuthorities < ActiveRecord::Migration[7.1]
  def change
    create_table :user_authorities do |t|
      t.string :name,        null:false, default: ""
      t.integer :auth_num,   null:false, default: "1"

      t.timestamps
    end
    add_index :user_authorities, :auth_num, unique: true

  end
end

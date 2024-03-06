class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  belongs_to :user_authority

  # scope :user_page_permission, ->(user_id) {
  #   joins(user_authority: { authority_page: :page })
  #   .where(users: { id: user_id })
  #   .select('authority_pages.page_id, 
  #             authority_pages.is_edit, 
  #             authority_pages.is_read, 
  #             pages.path')
  # }

   validates :login_id, presence: true, uniqueness: true
end

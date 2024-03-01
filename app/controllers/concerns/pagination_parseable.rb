module PaginationParseable
  extend ActiveSupport::Concern

  module ClassMethods
    def set_pagination_callback(resources_name, actions)
      after_action -> { generate_pagination_header(resources_name) }, only: actions
    end
  end

  private

  def pagination_params
    params.permit(:page, :limit)
  end

  def generate_pagination_header(resources_name)
    resources = instance_variable_get("@#{resources_name}")
    generate_x_total_count_header(resources)
  end

  def generate_x_total_count_header(resources)
    response.set_header("Access-Control-Expose-Headers", "X-Total-Count")
    response.set_header("X-Total-Count", resources.total_count.to_s)
  end
end

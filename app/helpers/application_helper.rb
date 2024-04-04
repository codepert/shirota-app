module ApplicationHelper
  def format_number_manual_insertion(x)
    if x.is_a?(String)
      return x  # Return the string as is
    elsif x.is_a?(Integer) || x.is_a?(Float)
      x = x.to_s
    else
      return "0"
    end

    return 0 if x.nil? || x.empty? || x !~ /\A[-+]?[0-9]*\.?[0-9]+\Z/

    parts = x.split(".")
    parts[0] = parts[0].gsub(/(\d)(?=(\d{3})+(?!\d))/, "\\1,")

    return parts.join(".")
  end
end

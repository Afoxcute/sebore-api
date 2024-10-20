# Base image
FROM php:8.1-apache

# Install necessary PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache mod_rewrite for .htaccess support
RUN a2enmod rewrite

# Set the working directory
WORKDIR /var/www/html

# Copy your CodeIgniter project files to the container
COPY ./ /var/www/html/

# Set the appropriate permissions for the CodeIgniter project
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Enable .htaccess by updating the default Apache config
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Expose port 80
EXPOSE 80

# Start Apache server
CMD ["apache2-foreground"]

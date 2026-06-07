# PHP 8.2 + Apache für die REST-API
FROM php:8.2-apache

# Systempakete für Composer (unzip) und MySQL-Treiber für PDO
RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo_mysql

# Composer (für optionale Abhängigkeiten wie PHPMailer)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache: DocumentRoot auf public/, mod_rewrite aktivieren
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN a2enmod rewrite
COPY docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Code wird im Dev per Volume gemountet; für Standalone-Builds hier kopieren:
# COPY . /var/www/html

EXPOSE 80

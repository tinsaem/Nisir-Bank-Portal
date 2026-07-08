#!/bin/bash

# SSL/HTTPS Setup using Let's Encrypt (Certbot)
# Run this script after your domain is pointing to the VPS

set -e

echo "==================================="
echo "SSL Setup with Let's Encrypt"
echo "==================================="

# Install Certbot
echo "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Prompt for domain
read -p "Enter your domain name (e.g., example.com): " DOMAIN

echo "Obtaining SSL certificate for $DOMAIN..."

# Get SSL certificate and automatically configure Nginx
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"

# Setup auto-renewal
echo "Setting up automatic renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Test renewal
certbot renew --dry-run

echo ""
echo "==================================="
echo "SSL Setup Complete!"
echo "==================================="
echo ""
echo "Your site is now accessible at: https://$DOMAIN"
echo ""
echo "Certificate will auto-renew before expiration"
echo "Check renewal timer: systemctl status certbot.timer"
echo ""

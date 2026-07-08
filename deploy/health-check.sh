#!/bin/bash
# Quick health check script

echo "=== System Health Check ==="
echo ""

echo "1. PM2 Status:"
pm2 status

echo ""
echo "2. Nginx Status:"
systemctl status nginx --no-pager | head -5

echo ""
echo "3. PostgreSQL Status:"
systemctl status postgresql --no-pager | head -5

echo ""
echo "4. Disk Usage:"
df -h / | tail -1

echo ""
echo "5. Memory Usage:"
free -h | grep Mem

echo ""
echo "6. App Response:"
curl -I http://localhost:3000 2>/dev/null | head -1

echo ""
echo "=== Health Check Complete ==="

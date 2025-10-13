#!/bin/bash

# Fix Font Awesome font paths
sed -i 's|url(../webfonts/|url(/assets/vendor/fontawesome/webfonts/|g' assets/vendor/fontawesome/css/all.min.css

echo "✅ Font Awesome paths fixed successfully!"
echo ""
echo "Changed:"
echo "  ../webfonts/ → /assets/vendor/fontawesome/webfonts/"
echo ""
echo "Next steps:"
echo "  1. git add assets/vendor/fontawesome/css/all.min.css"
echo "  2. git commit -m 'Fix Font Awesome font paths'"
echo "  3. git push"
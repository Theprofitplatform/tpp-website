#!/bin/bash

echo "======================================"
echo "Testing The Profit Platform Pages"
echo "======================================"

BASE_URL="http://127.0.0.1:8080"
PAGES=("index.html" "about.html" "services.html" "contact.html")
PASS_COUNT=0
FAIL_COUNT=0

for page in "${PAGES[@]}"; do
    echo -e "\nTesting $page..."

    # Check if page loads
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$page")

    if [ "$STATUS" = "200" ]; then
        echo "  ✓ Page loads successfully (HTTP $STATUS)"

        # Check for critical CSS files
        if curl -s "$BASE_URL/$page" | grep -q 'href="css/style.min.css"'; then
            echo "  ✓ Main CSS file referenced (minified)"
        else
            echo "  ✗ Main CSS file not found"
            ((FAIL_COUNT++))
        fi

        # Check for specific elements based on page
        if [ "$page" = "services.html" ]; then
            if curl -s "$BASE_URL/$page" | grep -q 'services-hero-enhanced'; then
                echo "  ✓ Enhanced hero section found"
            else
                echo "  ✗ Enhanced hero section missing"
                ((FAIL_COUNT++))
            fi
        fi

        if [ "$page" = "about.html" ]; then
            if curl -s "$BASE_URL/$page" | grep -q 'about-hero'; then
                echo "  ✓ About hero section found"
            else
                echo "  ✗ About hero section missing"
                ((FAIL_COUNT++))
            fi

            # Check for about page specific classes
            if curl -s "$BASE_URL/$page" | grep -q 'value-card'; then
                echo "  ✓ Value cards found"
            else
                echo "  ✗ Value cards missing"
                ((FAIL_COUNT++))
            fi
        fi

        ((PASS_COUNT++))
    else
        echo "  ✗ Page failed to load (HTTP $STATUS)"
        ((FAIL_COUNT++))
    fi
done

# Test CSS files directly
echo -e "\nTesting CSS files..."

# Test minified CSS
MIN_CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/css/style.min.css")
if [ "$MIN_CSS_STATUS" = "200" ]; then
    echo "  ✓ style.min.css loads successfully"

    # Check for specific CSS rules in minified version
    if curl -s "$BASE_URL/css/style.min.css" | grep -q 'services-hero-enhanced'; then
        echo "  ✓ Services hero CSS found"
    else
        echo "  ✗ Services hero CSS missing"
        ((FAIL_COUNT++))
    fi

    if curl -s "$BASE_URL/css/style.min.css" | grep -q 'about-hero'; then
        echo "  ✓ About hero CSS found"
    else
        echo "  ✗ About hero CSS missing"
        ((FAIL_COUNT++))
    fi
else
    echo "  ✗ style.min.css failed to load"
    ((FAIL_COUNT++))
fi

# Also test regular CSS file exists
CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/css/style.css")
if [ "$CSS_STATUS" = "200" ]; then
    echo "  ✓ style.css (source) also available"
else
    echo "  ⚠ style.css (source) not available"
fi

echo ""
echo "======================================"
echo "RESULTS: $PASS_COUNT pages passed"
if [ "$FAIL_COUNT" -gt 0 ]; then
    echo "WARNING: $FAIL_COUNT issues found"
else
    echo "All tests passed successfully!"
fi
echo "======================================"
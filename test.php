<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nutrition ID Multi-Select</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>

        .nutrition-select-container {
            box-sizing: border-box;
            padding: 20px;
            position: relative;
            margin-bottom: 25px;
        }

        .custom-select {
            position: relative;
            width: 100%;
            border-radius: 16px;
            border: 3px solid #FFAD84;
        }

        .select-box {
            display: flex;
            align-items: center;
            min-height: 30px;
            padding: 8px 15px;
            cursor: pointer;
        }

        .selected-options {
            display: flex;
            flex-wrap: wrap;
            flex: 1;
            gap: 8px;
            align-items: center;
        }

        .placeholder {
            color: #888;
        }

        .tag {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            background-color: #ffe8d6;
            color: #ba6253;
            border-radius: 16px;
            font-size: 14px;
            margin-right: 4px;
            margin-bottom: 4px;
        }

        .tag .remove-tag {
            cursor: pointer;
            margin-left: 6px;
            font-weight: bold;
            font-size: 16px;
        }

        .arrow {
            margin-left: auto;
            transition: transform 0.3s;
        }

        .custom-select.open .arrow i {
            transform: rotate(180deg);
        }

        .options {
            position: absolute;
            width: 100%;
            max-height: 250px;
            overflow-y: auto;
            border: 1px solid #ccc;
            border-radius: 10px;
            background-color: #fff;
            z-index: 3;
            display: none;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .custom-select.open + .options {
            display: block;
        }

        .option-search-tags {
            position: sticky;
            top: 0;
            display: flex;
            padding: 10px;
            border-bottom: 1px solid #rgb(255, 205, 190);
        }

        .search-tags {
            flex: 1;
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }

        .clear {
            border: none;
            background: transparent;
            cursor: pointer;
            margin-left: 8px;
            color: #888;
        }

        .clear:hover {
            color: #333;
        }

        .option {
            padding: 10px 15px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .option:hover {
            background-color: #ffe8d6;
        }

        .option.active {
            color: #ba6253;
            background-color: #ffe8d6;
        }

        .no-result-message {
            padding: 15px;
            text-align: center;
            color: #888;
        }

        .option.all-tags {
            font-weight: bold;
            border-bottom: 1px solid #eee;
        }

        .tag_error_msg {
            display: none;
            color: #d9534f;
            font-size: 12px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">     
        <div class="nutrition-select-container">
            <div class="custom-select">
                <div class="select-box">
                    <input type="text" class="tags_input" name="nutrition_ids" hidden/>
                    <div class="selected-options">
                        <span class="placeholder">Select nutrition IDs</span>
                    </div>
                    <div class="arrow">
                        <i class="fas fa-angle-down"></i>
                    </div>
                </div>
            </div>
            <div class="options">
                <div class="option-search-tags">
                    <input type="text" class="search-tags" placeholder="Search nutrition IDs..."/>
                    <button type="button" class="clear"><i class="fas fa-times"></i></button>
                </div>
                <div class="option all-tags" data-value="all">Select All</div>
                <div class="option" data-value="NID001">Protein (NID001)</div>
                <div class="option" data-value="NID002">Carbohydrates (NID002)</div>
                <div class="option" data-value="NID003">Fat (NID003)</div>
                <div class="option" data-value="NID004">Vitamin A (NID004)</div>
                <div class="option" data-value="NID005">Vitamin B1 (NID005)</div>
                <div class="option" data-value="NID006">Vitamin B2 (NID006)</div>
                <div class="option" data-value="NID007">Vitamin B6 (NID007)</div>
                <div class="option" data-value="NID008">Vitamin B12 (NID008)</div>
                <div class="option" data-value="NID009">Vitamin C (NID009)</div>
                <div class="option" data-value="NID010">Vitamin D (NID010)</div>
                <div class="option" data-value="NID011">Vitamin E (NID011)</div>
                <div class="option" data-value="NID012">Calcium (NID012)</div>
                <div class="option" data-value="NID013">Iron (NID013)</div>
                <div class="option" data-value="NID014">Zinc (NID014)</div>
                <div class="option" data-value="NID015">Magnesium (NID015)</div>
                <div class="no-result-message" style="display:none;">No matching nutrition IDs found</div>
            </div>
            <span class="tag_error_msg">This field is required</span>
        </div>
    </div>
</body>

    
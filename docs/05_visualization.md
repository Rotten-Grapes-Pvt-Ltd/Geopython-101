---
icon: material/chart-line
---

# Module 5: Visualization with Matplotlib & Leafmap

## Learning Goals
- Create static maps with matplotlib
- Plot multiple GeoPandas layers
- Introduction to leafmap for interactive mapping
- Change basemaps and add layers
- Add popups and interactive elements
- Export and print maps

## Setting Up the Environment

```python
import geopandas as gpd
import matplotlib.pyplot as plt
import numpy as np
import leafmap
import warnings
warnings.filterwarnings('ignore')

# Load sample data
world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
cities = gpd.read_file(gpd.datasets.get_path('naturalearth_cities'))

print("=== DATA LOADED ===")
print(f"World countries: {len(world)}")
print(f"Cities: {len(cities)}")
```

## 1. Basic Plotting with Matplotlib

### Single Layer Visualization

```python
# Basic world map
fig, ax = plt.subplots(1, 1, figsize=(15, 10))

# Plot world countries
world.plot(ax=ax, color='lightblue', edgecolor='black', linewidth=0.5)

# Customize the map
ax.set_title('World Countries', fontsize=16, fontweight='bold')
ax.set_xlabel('Longitude')
ax.set_ylabel('Latitude')

# Remove axis ticks for cleaner look
ax.set_xticks([])
ax.set_yticks([])

plt.tight_layout()
plt.show()
```

### Multiple Layer Visualization

```python
# Plot multiple layers together
fig, ax = plt.subplots(1, 1, figsize=(15, 10))

# Plot countries as base layer
world.plot(ax=ax, color='lightgray', edgecolor='black', linewidth=0.3, alpha=0.7)

# Plot cities on top
cities.plot(ax=ax, color='red', markersize=20, alpha=0.8)

# Customize
ax.set_title('World Countries and Major Cities', fontsize=16, fontweight='bold')
ax.set_xlim(-180, 180)
ax.set_ylim(-60, 80)
ax.set_xticks([])
ax.set_yticks([])

plt.tight_layout()
plt.show()
```

### Choropleth Maps

```python
# Create choropleth map by population
fig, ax = plt.subplots(1, 1, figsize=(15, 10))

# Plot with population-based colors
world.plot(
    column='pop_est',
    ax=ax,
    cmap='YlOrRd',
    edgecolor='black',
    linewidth=0.3,
    legend=True,
    legend_kwds={'label': 'Population Estimate', 'shrink': 0.8}
)

# Add cities
cities.plot(ax=ax, color='blue', markersize=15, alpha=0.7)

ax.set_title('World Population and Major Cities', fontsize=16, fontweight='bold')
ax.set_xticks([])
ax.set_yticks([])

plt.tight_layout()
plt.show()
```

### Focused Regional Maps

```python
# Focus on Europe
europe = world[world['continent'] == 'Europe']
europe_cities = cities[cities['continent'] == 'Europe']

fig, ax = plt.subplots(1, 1, figsize=(12, 10))

# Plot European countries
europe.plot(ax=ax, color='lightgreen', edgecolor='black', linewidth=0.5)

# Plot European cities
europe_cities.plot(ax=ax, color='red', markersize=50, alpha=0.8)

# Add city labels for major cities
major_cities = europe_cities[europe_cities['pop_max'] > 2000000]
for idx, city in major_cities.iterrows():
    ax.annotate(city['name'], 
                (city.geometry.x, city.geometry.y),
                xytext=(5, 5), textcoords='offset points',
                fontsize=8, fontweight='bold')

ax.set_title('European Countries and Major Cities', fontsize=14, fontweight='bold')
ax.set_xlim(-25, 45)
ax.set_ylim(35, 75)

plt.tight_layout()
plt.show()
```

## 2. Introduction to Leafmap

### What is Leafmap?

**Leafmap** is a Python package for interactive mapping and geospatial analysis built on top of ipyleaflet and folium. It provides an easy-to-use interface for creating interactive maps.

```python
# Create a basic leafmap
m = leafmap.Map(center=[20, 0], zoom=2)
m
```

### Basic Map Creation

```python
# Create map with custom settings
m = leafmap.Map(
    center=[40, -100],  # [latitude, longitude]
    zoom=4,
    height='600px'
)

# Display the map
m
```

## 3. Changing Basemaps

### Available Basemaps

```python
# List available basemaps
print("Available basemaps:")
for basemap in leafmap.basemaps.keys():
    print(f"  - {basemap}")
```

### Switching Basemaps

```python
# Create map with different basemap
m = leafmap.Map(center=[40, -100], zoom=4)

# Add basemap selector
m.add_basemap('Esri.WorldImagery')  # Satellite imagery
m
```

```python
# Try different basemaps
m = leafmap.Map(center=[40, -100], zoom=4)
m.add_basemap('CartoDB.Positron')  # Light basemap
m
```

```python
# Terrain basemap
m = leafmap.Map(center=[40, -100], zoom=4)
m.add_basemap('Esri.WorldTopoMap')  # Topographic map
m
```

## 4. Adding GeoPandas Layers

### Add Vector Data

```python
# Create map and add countries
m = leafmap.Map(center=[20, 0], zoom=2)

# Add world countries
m.add_gdf(
    world,
    layer_name='Countries',
    fill_colors=['lightblue'],
    line_colors=['black'],
    line_widths=[0.5]
)

m
```

### Add Multiple Layers

```python
# Create map with multiple layers
m = leafmap.Map(center=[20, 0], zoom=2)

# Add countries layer
m.add_gdf(
    world,
    layer_name='Countries',
    fill_colors=['lightgray'],
    line_colors=['black'],
    line_widths=[0.3]
)

# Add cities layer
m.add_gdf(
    cities,
    layer_name='Cities',
    fill_colors=['red'],
    point_size=5
)

# Add layer control
m.add_layer_control()

m
```

### Styled Layers

```python
# Create styled map
m = leafmap.Map(center=[20, 0], zoom=2)

# Add countries with population-based styling
m.add_gdf(
    world,
    column='pop_est',
    layer_name='Population',
    cmap='YlOrRd',
    legend_title='Population',
    line_colors=['black'],
    line_widths=[0.3]
)

m
```

## 5. Adding Popups

### Basic Popups

```python
# Create map with popups
m = leafmap.Map(center=[20, 0], zoom=2)

# Add countries with popup information
m.add_gdf(
    world,
    layer_name='Countries',
    info_cols=['name', 'continent', 'pop_est'],  # Columns to show in popup
    fill_colors=['lightblue'],
    line_colors=['black']
)

m
```

### Custom Popup Content

```python
# Create formatted popup content
world_popup = world.copy()
world_popup['popup_info'] = world_popup.apply(
    lambda row: f"""
    <b>{row['name']}</b><br>
    Continent: {row['continent']}<br>
    Population: {row['pop_est']:,}<br>
    GDP: ${row['gdp_md_est']:,.0f}M
    """, axis=1
)

m = leafmap.Map(center=[20, 0], zoom=2)

# Add with custom popup
m.add_gdf(
    world_popup,
    layer_name='Countries',
    info_cols=['popup_info'],
    fill_colors=['lightgreen'],
    line_colors=['black']
)

m
```

### City Popups

```python
# Create map with city popups
m = leafmap.Map(center=[20, 0], zoom=2)

# Add countries
m.add_gdf(
    world,
    layer_name='Countries',
    fill_colors=['lightgray'],
    line_colors=['black'],
    line_widths=[0.3]
)

# Add cities with detailed popups
m.add_gdf(
    cities,
    layer_name='Cities',
    info_cols=['name', 'country', 'pop_max'],
    fill_colors=['red'],
    point_size=8
)

m.add_layer_control()
m
```

## 6. Print and Export Maps

### Save as HTML

```python
# Create and save map
m = leafmap.Map(center=[40, -100], zoom=4)

# Add some data
m.add_gdf(
    world[world['continent'] == 'North America'],
    layer_name='North America',
    fill_colors=['lightgreen'],
    line_colors=['black']
)

# Save to HTML file
m.to_html('north_america_map.html')
print("Map saved as 'north_america_map.html'")
```

### Save as Image

```python
# Save map as PNG image
m = leafmap.Map(center=[40, -100], zoom=4)

m.add_gdf(
    world[world['continent'] == 'North America'],
    layer_name='North America',
    fill_colors=['lightblue'],
    line_colors=['black']
)

# Save as image (requires additional setup)
# m.to_image('north_america_map.png')
print("Map ready for screenshot or HTML export")
```

### Print-Ready Maps

```python
# Create a print-ready map with title and legend
m = leafmap.Map(center=[20, 0], zoom=2, height='800px')

# Add styled world map
m.add_gdf(
    world,
    column='pop_est',
    layer_name='World Population',
    cmap='YlOrRd',
    legend_title='Population Estimate',
    line_colors=['black'],
    line_widths=[0.5]
)

# Add cities
m.add_gdf(
    cities.head(50),  # Top 50 cities
    layer_name='Major Cities',
    fill_colors=['blue'],
    point_size=6
)

# Add layer control
m.add_layer_control()

# Add title (as text overlay)
m.add_text('World Population and Major Cities', 
           position='topright', 
           font_size='16px', 
           font_weight='bold')

m
```

## Practice Problems

### Problem 1: Regional Analysis Map
Create a comprehensive map of a specific region:

```python
# TODO:
# 1. Filter data for a specific continent
# 2. Create a matplotlib subplot with 2 maps
# 3. Show population and GDP in different maps
# 4. Add appropriate legends and titles
# 5. Style the maps professionally

# Your code here
```

### Problem 2: Interactive City Explorer
Build an interactive map for exploring cities:

```python
# TODO:
# 1. Create a leafmap with satellite basemap
# 2. Add countries with population styling
# 3. Add cities with size based on population
# 4. Create informative popups for cities
# 5. Add layer controls and measurement tools

# Your code here
```

### Problem 3: Comparison Map
Create a split-screen comparison:

```python
# TODO:
# 1. Create a leafmap with split view
# 2. Show different data on each side
# 3. Add appropriate styling
# 4. Include popups and controls
# 5. Export as HTML

# Your code here
```

## Key Takeaways

!!! success "What You've Learned"
    - **Static Visualization**: Creating publication-quality maps with matplotlib
    - **Interactive Mapping**: Building engaging maps with leafmap
    - **Layer Management**: Adding and styling multiple data layers
    - **User Interaction**: Implementing popups and controls
    - **Export Options**: Saving maps for sharing and printing

!!! tip "Best Practices"
    - Choose appropriate basemaps for your data
    - Use consistent styling across layers
    - Provide informative popups and legends
    - Test interactivity before sharing
    - Consider your audience when designing maps
    - Always include proper attribution


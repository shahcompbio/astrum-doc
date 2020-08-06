---
title: Mira - Elasticsearch
sidebar_label: Elasticsearch
---

Data for Mira is stored in Elasticsearch. This page will lay out the schema within Elasticsearch. For information on how to load data, see [here](mira/loading-data.md)

## Indices

### `marker_genes`

Marker genes for each cell type, used when running a sample through CellAssign. Each dashboard can have separate set of marker genes.

```
{
    "dashboard_id": String,
    "cell_type": String,
    "genes": [String]
}
```

### `dashboard_entry`

Metadata for each dashboard loaded into Mira.

```
{
    "dashboard_id": String,
    "type": String,
    "samples": [Sample]
}
```

:::note
For MSK SPECTRUM, we have an additional `date` field that represents when this dashboard was last processed by Isabl.
:::

Sample can have any number of metadata fields as specified in `samples_metadata.json`, but these are the ones we have been using:

```
{
    "sample_id": String,
    "patient_id": String,
    "sort": String,
    "surgery": String,
    "treatment": String,
    "site": String
}
```

### `dashboard_cells_<dashboard_id>`

Data for each cell in each dashboard.

The example below shows the minimum amount of fields contained in a cell record. Ultimately this will depend on the columns present in `cells.tsv`. The metadata associated with `sample_id` (in `sample_metadata.json`) is also denormalized here, to facilitate faster filtering.

```
{
    "dashboard_id": String,
    "sample_id" : String,
    "cell_id" : String,
    "x": Float,
    "y": Float,
    "cell_type" : String
    "genes": [Gene]
}
```

Genes:

```
{
    "gene": String,
    "log_count": Float
}
```

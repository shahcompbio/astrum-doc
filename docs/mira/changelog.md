---
title: Mira - Changelog
sidebar_label: Changelog
---

All notable changes to Mira will be documented here. The unreleased version is contained in the `staging` branch. The current released version is in `master`.

## 1.0.0

## Changed (released - Aug 6, 2020)

- ElasticSearch input data now several tsv, json files
- ElasticSearch schema now nests gene records inside cell records
- Store different marker genes for different dashboards
- Different dashboard types now separated by tabbed view instead of dropdown
- Font / general themeing change
- Removed counts from CellAssign table

## 0.3.1

### Added

- Prototype dashboard for correlation of two UMAP plots at `/correlation`

### Changed

- highlighted group schema now has array as values in preparation for multi facade selection
- overall colour scheming change

## 0.3.0 (released - Feb 28, 2020)

### Added

- Histograms for label in each UMAP plot
- Prototype dashboard for cumulative gene expression at `/cumulative-gene`

### Changed

- UMAP plot is binned with majority/avg label colouring
- Interaction to show density of subset
- Remove cell type highlighting from CellAssign table
- Add x,y position to each gene record
- Patient dashboards merges CD45P and CD45N data
- Update Spectrum header

## 0.2.0 (released - Jan 16, 2020)

### Changed

- Index for cells is now `dashboard_cells`, merges redim and sample cells indices
- UI fixes for metadata table
- Bug fixes for query sizes in rho table and scatterplot
- Revamp of loading CLI

## 0.1.0 (released - Nov 25, 2019)

### Added

- Coloring on site, surgery, treatment for non-sample dashboards

### Changed

- Metadata table support for merged dashboards
- Metadata table aesthetic changes
- CLI for loader
- Loading support for patient dashboards
  - bulk loading by type
  - memory improvements for gene matrix
  - merged metadata and dashboard entry together
- Bug fixes

## 0.0.3 (released - Nov 12, 2019)

### Added

- Selection based off patient, sample, CD45 sorting
- `.env` files for base URLs to enable quicker setup of instances

### Changed

- Spectrum header update
- Revamp of QC table, to combine with sample selection and filtering
- Scatterplot -> hexbin density plot with scatterplot by cell type overlaid
- Readded gene selection
- Removal of abundance plot in favor of proper plot legend
- Loader pulls from rdata, not JSON
- Loader pulls metadata from Google Sheets

## 0.0.2 (released - August 1 2019)

### Added

- Patient-level dashboard
- CellAssign table

### Changed

## 0.0.1 (released - May 1 2019)

### Added

- Patient, then sample selection
- tSNE plot with individual cell highlighting
- Searchable selection to colour tSNE plot by cell type, cluster, or gene name
- Bar / Line plot to show abundance of each colouring type, with cross highlighting
- python scripts to load JSON files into Elasticsearch

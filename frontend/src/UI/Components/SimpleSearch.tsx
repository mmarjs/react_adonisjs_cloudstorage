import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import { ReactComponent as SearchIcon } from 'Image/icon_viewer.svg'
import makeStyles from '@material-ui/core/styles/makeStyles'
import ClearIcon from '@material-ui/icons/Clear'
import { useIsMounted } from 'Lib'
import { SimpleSearchProps } from 'types'
import debounce from 'lodash/debounce'

const useStyles = makeStyles((theme) => ({
  wrapper: {
    height: '70vh',
    width: '100vw',
  },
  searchOption: {
    'position': 'relative',
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      border: 0,
    },
    '& .MuiInput-underline:before': {
      border: 0,
    },
    '& .MuiInput-underline:after': {
      border: 0,
    },
    '& .MuiSelect-select': {
      border: '1px solid #5FB158',
      height: '28px',
      fontSize: '14px',
      color: '#636161',
      padding: '0 24px 0 10px',
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '0px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#5FB158',
    },
  },
  searchClearIcon: {
    position: 'absolute',
    left: '160px',
    top: '6px',
    fontSize: '18px',
    fill: '#5FB158',
    cursor: 'pointer',
  },
  searchTextInput: {
    height: '9px',
    fontSize: '14px',
  },
  labelRoot: {
    marginTop: '-3px',
  },
  labelFocused: {
    marginTop: '0px',
  },
  toolIconButton: {
    float: 'right',
    backgroundColor: '#5FB158',
    borderRadius: '10%',
    height: '30px',
    padding: '7px',
    margin: '0 5px 0 5px',
  },
  toolIcon: {
    width: '15px',
    fill: 'white',
  },
}))
export function SimpleSearch(props: SimpleSearchProps) {
  const { onChange, onClearSearch } = props
  const classes = useStyles()
  const { setSafely } = useIsMounted()
  const [searchText, setSearchText] = useState<string>('')
  const [searchFlag, setSearchFlag] = useState<boolean>(false)

  const handelClearSearch = () => {
    setSearchText('')
    onClearSearch()
  }

  const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
    const debouncedSave = debounce(() => onChange(event), 500)
    debouncedSave()
  }

  const onSetSearchMode = () => {
    if (searchFlag) {
      setSearchText('')
      onClearSearch()
    }
    setSafely(setSearchFlag, !searchFlag)
  }

  return (
    <Grid item className={classes.searchOption}>
      {searchFlag && (
        <TextField
          id="search"
          name="search"
          label="Search"
          type="text"
          variant="outlined"
          size="small"
          InputProps={{ classes: { input: classes.searchTextInput } }}
          InputLabelProps={{
            classes: {
              root: classes.labelRoot,
              focused: classes.labelFocused,
            },
          }}
          value={searchText}
          onChange={handleChangeSearch}
        />
      )}
      {searchText !== '' && (
        <ClearIcon className={classes.searchClearIcon} onClick={() => handelClearSearch()} />
      )}
      <IconButton className={classes.toolIconButton} onClick={() => onSetSearchMode()}>
        <SearchIcon className={classes.toolIcon} />
      </IconButton>
    </Grid>
  )
}

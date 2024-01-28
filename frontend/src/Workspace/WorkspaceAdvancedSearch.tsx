import React, { useState, useContext } from 'react'
import { useSelector } from 'react-redux'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import FormGroup from '@material-ui/core/FormGroup'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { FormLabel } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import { useForm, Controller } from 'react-hook-form'
import { AppState } from 'App/reducers'
import { WorkspaceAdvancedSearchProps } from 'types'
import { WorkspaceGridContext, Store } from 'Workspace'
import { useWorkspaceData } from './useWorkspaceData'
import { AdvancedSearchFilterItem } from './types'

const useStyles = makeStyles((theme) => ({
  root: {},
  shareForm: {
    padding: '10px',
  },
  shareFormTextField: {
    width: '100%',
  },
  breadText: {
    fontSize: '0.8rem',
  },
  breadcrumbs: {
    margin: 0,
    paddingLeft: '10px',
  },
  formControlLabel: {
    margin: 0,
    width: '100%',
  },
  expirationSelect: {
    'width': '30%',
    '& legend': {
      width: 0,
    },
  },
  sizeSelect: {
    'width': '30%',
    'marginRight': '25px',
    '& legend': {
      width: 0,
    },
  },
  locationSelect: {
    'width': '100%',
    '& legend': {
      width: 0,
    },
  },
  expirationTime: {
    float: 'right',
    width: '95%',
  },
  expiresTime: {
    width: '95%',
  },
  groupWrapper: {
    paddingLeft: '5px',
    justifyContent: 'space-between',
  },
  dateGroupWrapper: {
    paddingLeft: '5px',
  },
  passwordLabel: {
    background: '#fff',
  },
  passwordForm: {
    width: '100%',
  },
  passwordRefreshIcon: {
    fill: '#5FB158',
    width: '20px',
  },
  wrapIcon: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    padding: '0 24px',
    bottom: '10px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#5FB158',
  },
  LinkCopyIcon: {
    width: '20px',
    marginLeft: '10px',
  },
  copyLinkGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  popperMenu: {
    zIndex: 999,
  },
  saveButton: {
    'width': 'auto',
    'backgroundColor': '#4472C4',
    'height': '30px',
    'paddingLeft': '15px',
    'borderRadius': '20px',
    '&:hover': {
      color: '#000',
    },
  },
  searchButton: {
    background: '#4472C4',
    color: '#ffffff',
    height: '30px',
    marginLeft: '8px',
    textTransform: 'capitalize',
  },
  sizeText: {
    width: '30%',
  },
  typeText: {
    width: '65%',
  },
}))

export function WorkspaceAdvancedSearch(props: WorkspaceAdvancedSearchProps) {
  const { onError } = props
  const classes = useStyles()
  const { onGetAdvancedSearch, clearPagination } = useWorkspaceData()
  const [owner, setOwner] = useState<number>(0)
  const [sizeCondition, setSizeCondition] = useState<number>(0)
  const [dateCondition, setDateCondition] = useState<number>(0)
  const [locationGroup, setLocationGroup] = useState<number>(0)
  const [type, setType] = useState<string>('Any')
  const [typeValue, setTypeValue] = useState<number>(0)
  const [access, setAccess] = useState<number>(0)
  const [sizeType, setSizeType] = useState<number>(0)
  const currentCaseId = useSelector((state: AppState) => state.workspaceData.caseId)
  const workgroupParentId = useSelector((state: AppState) => state.workspaceData.workgroupParentId)
  const personalParentId = useSelector((state: AppState) => state.workspaceData.personalParentId)
  const currentParentId = useSelector((state: AppState) => state.tableViewData.fieldNodeId)
  const workspaceUsers = useSelector((state: AppState) => state.workspaceData.workspaceUsers)
  const userId = useSelector((state: AppState) => state.user.id)
  const { folderPath, setSearchMode, setSearchTableData, setSearchAdvancedFilterData } = useContext(
    WorkspaceGridContext
  ) as Store

  const changeOwner = (event: React.ChangeEvent<{ value: unknown }>) => {
    setOwner(event.target.value as number)
  }

  const changeSizeCondition = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSizeCondition(event.target.value as number)
  }

  const changeDateCondition = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDateCondition(event.target.value as number)
  }

  const changeAccess = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAccess(event.target.value as number)
  }

  const changeLocationGroup = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLocationGroup(event.target.value as number)
  }

  const changeType = (event: React.ChangeEvent<{ value: unknown }>) => {
    const type: any = ['Any', 'MS Office', 'Music', 'Video', 'Photo', 'Extension']
    setType(type[event.target.value as number])
    setTypeValue(event.target.value as number)
  }

  const changeSizeType = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSizeType(event.target.value as number)
  }

  const onClear = () => {
    setOwner(0)
    setSizeCondition(0)
    setDateCondition(0)
    setAccess(0)
    setLocationGroup(0)
    setType('Any')
    setSizeType(0)
    reset()
    setSearchMode(false)
    setSearchTableData([])
    clearPagination()
  }

  const schema = yup.object().shape({})

  const { register, control, setValue, handleSubmit, reset } = useForm<any>({
    resolver: yupResolver(schema),
  })

  const onSubmit = (data: AdvancedSearchFilterItem) => {
    setSearchAdvancedFilterData(data)
    if (
      data.access === 0 &&
      data.location === 0 &&
      data.modifieddate === 0 &&
      data.name === '' &&
      data.owner === 0 &&
      data.sizecondition === 0 &&
      data.type === 'Any'
    ) {
      onError('Please fill in at least one field.')
      return
    }
    let folderId: number = 0
    if (folderPath.charAt(0) === 'w') {
      folderId = currentParentId
        ? currentParentId
        : folderPath.charAt(0) === 'w'
        ? workgroupParentId
        : 0
      onGetAdvancedSearch(data, folderId, currentCaseId, 1, 100)
      setSearchMode(true)
    } else if (folderPath.charAt(0) === 'p') {
      folderId = currentParentId
        ? currentParentId
        : folderPath.charAt(0) === 'p'
        ? personalParentId
        : 0
      onGetAdvancedSearch(data, folderId, userId, 1, 100)
      setSearchMode(true)
    }
  }

  const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      setSearchMode(false)
      setSearchTableData([])
    }
  }

  return (
    <Grid container item justify="center" className={classes.root}>
      <Grid item sm={11} xs={12}>
        <form id="search-form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container item xs={12}>
            <Grid item sm={6} xs={12} className={classes.shareForm}>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Name:</FormLabel>
                  </Grid>
                  <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                    <TextField
                      id="name"
                      name="name"
                      inputRef={register}
                      type="text"
                      variant="outlined"
                      label="Name"
                      size="small"
                      onChange={handleChangeSearch}
                      className={classes.shareFormTextField}
                    />
                  </Grid>
                </Grid>
              </FormGroup>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Size:</FormLabel>
                  </Grid>
                  <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                    <Controller
                      id="sizeCondition"
                      name="sizecondition"
                      label="Size"
                      control={control}
                      defaultValue={sizeCondition}
                      render={({ onChange, ref }) => (
                        <FormControl
                          variant="outlined"
                          size="small"
                          className={classes.expirationSelect}
                        >
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={sizeCondition}
                            onChange={(event) => {
                              changeSizeCondition(event)
                              setValue('sizecondition', event.target.value)
                            }}
                          >
                            <MenuItem value={0}>Any</MenuItem>
                            <MenuItem value={1}>Is greater than</MenuItem>
                            <MenuItem value={2}>Is less than</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                    {sizeCondition !== 0 && (
                      <>
                        <TextField
                          id="size"
                          name="size"
                          inputRef={register}
                          type="number"
                          variant="outlined"
                          label=""
                          size="small"
                          className={classes.sizeText}
                        />
                        <Controller
                          id="sizetype"
                          name="sizetype"
                          label=""
                          control={control}
                          defaultValue={sizeType}
                          render={({ onChange, ref }) => (
                            <FormControl
                              variant="outlined"
                              size="small"
                              className={classes.expirationSelect}
                            >
                              <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                value={sizeType}
                                onChange={(event) => {
                                  changeSizeType(event)
                                  setValue('sizetype', event.target.value)
                                }}
                              >
                                <MenuItem value={0}>KB</MenuItem>
                                <MenuItem value={1}>MB</MenuItem>
                                <MenuItem value={2}>GB</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
              </FormGroup>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Modified Date:</FormLabel>
                  </Grid>
                  <Grid
                    container
                    item
                    sm={9}
                    xs={12}
                    className={
                      dateCondition !== 0 && dateCondition === 4
                        ? classes.groupWrapper
                        : classes.dateGroupWrapper
                    }
                  >
                    <Controller
                      id="modifieddate"
                      name="modifieddate"
                      label=""
                      control={control}
                      defaultValue={dateCondition}
                      render={({ onChange, ref }) => (
                        <FormControl
                          variant="outlined"
                          size="small"
                          className={
                            dateCondition !== 0 && dateCondition === 4
                              ? classes.expirationSelect
                              : classes.sizeSelect
                          }
                        >
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={dateCondition}
                            onChange={(event) => {
                              changeDateCondition(event)
                              setValue('modifieddate', event.target.value)
                            }}
                          >
                            <MenuItem value={0}>Any</MenuItem>
                            <MenuItem value={1}>Is exactly</MenuItem>
                            <MenuItem value={2}>Is before</MenuItem>
                            <MenuItem value={3}>Is after</MenuItem>
                            <MenuItem value={4}>Is Between</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                    {dateCondition !== 0 && (
                      <TextField
                        id="date-first"
                        name="firstdate"
                        type="date"
                        inputRef={register}
                        defaultValue="2017-05-24"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="outlined"
                        size="small"
                        className={classes.expirationSelect}
                      />
                    )}
                    {dateCondition !== 0 && dateCondition === 4 && (
                      <TextField
                        id="date-second"
                        name="seconddate"
                        type="date"
                        inputRef={register}
                        defaultValue="2017-05-24"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="outlined"
                        size="small"
                        className={classes.expirationSelect}
                      />
                    )}
                  </Grid>
                </Grid>
              </FormGroup>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Access:</FormLabel>
                  </Grid>
                  <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                    <Controller
                      id="access"
                      name="access"
                      label=""
                      control={control}
                      defaultValue={access}
                      render={({ onChange, ref }) => (
                        <FormControl
                          variant="outlined"
                          size="small"
                          className={classes.expirationSelect}
                        >
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={access}
                            onChange={(event) => {
                              changeAccess(event)
                              setValue('access', event.target.value)
                            }}
                          >
                            <MenuItem value={0}>Any</MenuItem>
                            <MenuItem value={1}>Private</MenuItem>
                            <MenuItem value={2}>Shared</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </Grid>
            <Grid item sm={6} xs={12} className={classes.shareForm}>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Location:</FormLabel>
                  </Grid>
                  <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                    <Controller
                      id="location"
                      name="location"
                      label=""
                      control={control}
                      defaultValue={locationGroup}
                      render={({ onChange, ref }) => (
                        <FormControl
                          variant="outlined"
                          size="small"
                          className={classes.locationSelect}
                        >
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={locationGroup}
                            onChange={(event) => {
                              changeLocationGroup(event)
                              setValue('location', event.target.value)
                            }}
                          >
                            <MenuItem value={0}>/Workgroup</MenuItem>
                            <MenuItem value={1}>/Personal</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </FormGroup>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Type:</FormLabel>
                  </Grid>
                  <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                    <Controller
                      id="type"
                      name="type"
                      label=""
                      control={control}
                      defaultValue={type}
                      render={({ onChange, ref }) => (
                        <FormControl
                          variant="outlined"
                          size="small"
                          className={classes.expirationSelect}
                        >
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={typeValue}
                            onChange={(event) => {
                              const type: any = [
                                'Any',
                                'MS Office',
                                'Music',
                                'Video',
                                'Photo',
                                'Extension',
                              ]
                              changeType(event)
                              setValue('type', type[event.target.value as number])
                            }}
                          >
                            <MenuItem value={0}>Any</MenuItem>
                            <MenuItem value={1}>MS Office</MenuItem>
                            <MenuItem value={2}>Music</MenuItem>
                            <MenuItem value={3}>Video</MenuItem>
                            <MenuItem value={4}>Photo</MenuItem>
                            <MenuItem value={5}>Extension</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                    {type === 'Extension' && (
                      <TextField
                        id="extension"
                        name="extension"
                        type="text"
                        inputRef={register}
                        variant="outlined"
                        label=""
                        size="small"
                        className={classes.typeText}
                      />
                    )}
                  </Grid>
                </Grid>
              </FormGroup>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Owner:</FormLabel>
                  </Grid>
                  <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                    <Controller
                      id="owner"
                      name="owner"
                      label=""
                      control={control}
                      defaultValue={owner}
                      render={({ onChange, ref }) => (
                        <FormControl
                          variant="outlined"
                          size="small"
                          className={classes.expirationSelect}
                        >
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={owner}
                            onChange={(event) => {
                              changeOwner(event)
                              setValue('owner', event.target.value)
                            }}
                          >
                            <MenuItem value={0}>Any</MenuItem>
                            {workspaceUsers.map((ele: any, index: number) => {
                              return (
                                <MenuItem value={ele.id} key={index}>
                                  {ele.first_name + ' ' + ele.last_name}
                                </MenuItem>
                              )
                            })}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </FormGroup>
              <FormGroup className={classes.saveButtonGroup}>
                <Button variant="contained" size="small" onClick={() => onClear()}>
                  Clear
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  className={classes.searchButton}
                  type="submit"
                >
                  Search
                </Button>
              </FormGroup>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  )
}
